require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const session = require("express-session");

const app = express();

// =========================
// PENDING USERS
// ยังไม่สร้าง USER_ID จนกว่าจะ Verify
// =========================

const pendingUsers = new Map();
const passwordResetTokens = new Map();

// =========================
// MIDDLEWARE
// =========================

app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "kmitl-travel-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

app.use(express.static(__dirname));

// =========================
// MYSQL
// =========================

// ใช้ pool แทน connection เดียว
// ถ้า connection หลุด (เช่น idle นานบน Railway) จะเปิดใหม่ให้อัตโนมัติ
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

db.query("SELECT 1", (err) => {
    if (err) {
        console.log("เชื่อมต่อ MySQL ไม่สำเร็จ");
        console.log(err);
        return;
    }

    console.log("เชื่อมต่อ MySQL สำเร็จ");
});

// =========================
// EMAIL - EMAILJS (HTTP API)
// =========================

const EMAILJS_KEYS = [
    "EMAILJS_SERVICE_ID",
    "EMAILJS_TEMPLATE_ID",
    "EMAILJS_PUBLIC_KEY",
    "EMAILJS_PRIVATE_KEY"
];

for (const key of EMAILJS_KEYS) {
    console.log(key + ":", process.env[key] ? "มีค่า" : "ไม่มีค่า");
}

async function sendEmail({ to, subject, html }) {

    const response = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                service_id: process.env.EMAILJS_SERVICE_ID,
                template_id: process.env.EMAILJS_TEMPLATE_ID,
                user_id: process.env.EMAILJS_PUBLIC_KEY,
                accessToken: process.env.EMAILJS_PRIVATE_KEY,
                template_params: {
                    to_email: to,
                    subject,
                    message_html: html
                }
            })
        }
    );

    const text = await response.text();

    if (!response.ok) {
        throw new Error("EmailJS " + response.status + ": " + text);
    }

    return { messageId: text };
}

/* =========================
   REGISTER
   สมัครสมาชิกและส่งอีเมลยืนยัน
   ยังไม่ INSERT ลงตาราง user
========================= */

app.post("/register", async (req, res) => {
    try {
        const username = String(req.body.username || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");
        const fname = String(req.body.fname || "").trim();
        const lname = String(req.body.lname || "").trim();

        if (!username || !email || !password || !fname || !lname) {
            return res.status(400).json({
                success: false,
                message: "กรุณากรอกข้อมูลให้ครบทุกช่อง"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
            });
        }

        // ตรวจว่าชื่อผู้ใช้หรืออีเมลมีอยู่ในระบบแล้วหรือไม่
        db.query(
            `SELECT USER_USERNAME, USER_EMAIL
             FROM \`user\`
             WHERE USER_USERNAME = ? OR USER_EMAIL = ?`,
            [username, email],
            async (err, users) => {
                if (err) {
                    console.error("REGISTER CHECK ERROR:", err);
                    return res.status(500).json({
                        success: false,
                        message: "ตรวจสอบข้อมูลไม่สำเร็จ กรุณาลองใหม่"
                    });
                }

                if (users.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: "Username หรือ Email นี้มีอยู่ในระบบแล้ว"
                    });
                }

                // ตรวจข้อมูลที่กำลังรอยืนยันในหน่วยความจำ
                for (const [oldToken, pending] of pendingUsers.entries()) {
                    if (
                        pending.username.toLowerCase() === username.toLowerCase() ||
                        pending.email.toLowerCase() === email
                    ) {
                        if (pending.expiresAt > Date.now()) {
                            return res.status(409).json({
                                success: false,
                                message: "Username หรือ Email นี้กำลังรอยืนยันอีเมล"
                            });
                        }

                        pendingUsers.delete(oldToken);
                    }
                }

                try {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const token = crypto.randomBytes(32).toString("hex");

                    const verifyLink =
                        `${req.protocol}://${req.get("host")}/verify?token=${token}`;

                    const html = `
                        <div style="font-family:Arial,sans-serif;padding:20px">
                            <h2>ยืนยันอีเมล - เที่ยวไหนดี สจล.</h2>
                            <p>สวัสดี ${fname}</p>
                            <p>กรุณากดปุ่มด้านล่างเพื่อยืนยันอีเมลและสมัครสมาชิก</p>
                            <a href="${verifyLink}"
                               style="display:inline-block;padding:12px 20px;background:#333;color:white;text-decoration:none;border-radius:8px">
                                ยืนยันอีเมล
                            </a>
                            <p>หากคุณไม่ได้สมัครสมาชิก สามารถละเว้นอีเมลนี้ได้</p>
                        </div>
                    `;

                    // ส่งอีเมลก่อน จึงเก็บข้อมูลรอยืนยัน
                    await sendEmail({
                        to: email,
                        subject: "ยืนยันอีเมล - เที่ยวไหนดี สจล.",
                        html
                    });

                    pendingUsers.set(token, {
                        username,
                        email,
                        password: hashedPassword,
                        fname,
                        lname,
                        expiresAt: Date.now() + 30 * 60 * 1000
                    });

                    return res.json({
                        success: true,
                        message: "ส่งอีเมลยืนยันแล้ว กรุณาตรวจสอบกล่องจดหมาย"
                    });
                } catch (emailErr) {
                    console.error("REGISTER EMAIL ERROR:", emailErr);

                    return res.status(500).json({
                        success: false,
                        message: "ส่งอีเมลยืนยันไม่สำเร็จ กรุณาตรวจสอบการตั้งค่าอีเมล"
                    });
                }
            }
        );
    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการสมัครสมาชิก"
        });
    }
});

/* =========================
   FORGOT PASSWORD
========================= */


app.post("/forgot-password", (req, res) => {
    const email = String(req.body.email || "").trim();

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "กรุณากรอกอีเมล"
        });
    }

    db.query(
        `SELECT USER_ID FROM \`user\` WHERE USER_EMAIL = ?`,
        [email],
        async (err, users) => {
            if (err) {
                console.error("FORGOT PASSWORD ERROR:", err);
                return res.status(500).json({
                    success: false,
                    message: "เกิดข้อผิดพลาด กรุณาลองใหม่"
                });
            }

            const genericMessage =
                "หากอีเมลนี้มีบัญชีอยู่ ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านให้ กรุณาตรวจสอบอีเมล";

            if (users.length === 0) {
    return res.status(404).json({
        success: false,
        message: "ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีเมลอีกครั้ง"
    });
}

            const userId = users[0].USER_ID;
            const token = crypto.randomBytes(32).toString("hex");
            const tokenHash = crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

            const resetLink =
                `${req.protocol}://${req.get("host")}/reset-password.html?token=${token}`;

            try {
                await sendEmail({
                    to: email,
                    subject: "รีเซ็ตรหัสผ่าน - เที่ยวไหนดี สจล.",
                    html: `
                        <div style="font-family:Arial,sans-serif;padding:20px">
                            <h2>รีเซ็ตรหัสผ่าน</h2>
                            <p>กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
                            ลิงก์นี้หมดอายุภายใน 30 นาที</p>
                            <a href="${resetLink}"
                               style="display:inline-block;padding:12px 20px;background:#333;color:white;text-decoration:none;border-radius:8px">
                                ตั้งรหัสผ่านใหม่
                            </a>
                            <p>หากคุณไม่ได้ร้องขอ สามารถละเว้นอีเมลนี้ได้</p>
                        </div>
                    `
                });

                passwordResetTokens.set(tokenHash, {
                    userId,
                    expiresAt: Date.now() + 30 * 60 * 1000,
                    used: false
                });

                return res.json({
    success: true,
    message: "ส่งอีเมลรีเซ็ตรหัสผ่านสำเร็จแล้ว"
});
            } catch (emailErr) {
                console.error("RESET EMAIL ERROR:", emailErr);

                return res.status(500).json({
                    success: false,
                    message: "ส่งอีเมลไม่สำเร็จ กรุณาลองใหม่"
                });
            }
        }
    );
});

/* =========================
   RESET PASSWORD
========================= */

app.post("/reset-password", async (req, res) => {
    const token = String(req.body.token || "").trim();
    const password = String(req.body.password || "");

    if (!token || !password) {
        return res.status(400).json({
            success: false,
            message: "กรุณากรอกข้อมูลให้ครบ"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
        });
    }

    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const reset = passwordResetTokens.get(tokenHash);

    if (!reset || reset.used || reset.expiresAt <= Date.now()) {
        passwordResetTokens.delete(tokenHash);
        return res.status(400).json({
            success: false,
            message: "ลิงก์ไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            "UPDATE `user` SET USER_PASSWORD = ? WHERE USER_ID = ?",
            [hashedPassword, reset.userId],
            (err, result) => {
                if (err) {
                    console.error("RESET PASSWORD ERROR:", err);
                    return res.status(500).json({
                        success: false,
                        message: "เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่"
                    });
                }

                if (result.affectedRows === 0) {
                    passwordResetTokens.delete(tokenHash);
                    return res.status(400).json({
                        success: false,
                        message: "ไม่พบบัญชีผู้ใช้ กรุณาขอลิงก์ใหม่"
                    });
                }

                passwordResetTokens.delete(tokenHash);

                return res.json({
    success: true,
    redirect: "/login.html",
    message: "เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่"
});
            }
        );
    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาด กรุณาลองใหม่"
        });
    }
});

// =========================
// VERIFY EMAIL
// =========================

app.get("/verify", (req, res) => {

    const token =
        req.query.token;

    if (!token) {
        return res.redirect("/verify.html?status=invalid");
    }

    // =========================
    // GET PENDING USER
    // =========================

   const pendingUser = pendingUsers.get(token);

if (!pendingUser || pendingUser.expiresAt <= Date.now()) {
    pendingUsers.delete(token);
    return res.redirect("/verify.html?status=invalid");
}

    // =========================
    // INSERT USER
    // ตอนนี้เท่านั้นที่สร้าง USER_ID
    // =========================

    const insertSql = `
        INSERT INTO \`user\`
        (
            USER_USERNAME,
            USER_EMAIL,
            USER_PASSWORD,
            USER_FNAME,
            USER_LNAME,
            USER_EMAIL_VERIFIED,
            USER_VERIFY_TOKEN
        )
        VALUES (?, ?, ?, ?, ?, 1, NULL)
    `;

    db.query(
        insertSql,
        [
            pendingUser.username,
            pendingUser.email,
            pendingUser.password,
            pendingUser.fname,
            pendingUser.lname
        ],
        (err, result) => {

            if (err) {

                console.log(
                    "VERIFY INSERT USER ERROR:",
                    err
                );

                return res.redirect("/verify.html?status=error");
            }

            console.log(
                "✅ VERIFY สำเร็จ"
            );

            console.log(
                "สร้าง USER_ID:",
                result.insertId
            );

            console.log(
                "Email:",
                pendingUser.email
            );

            // =========================
            // ลบข้อมูลที่รอยืนยัน
            // =========================

            pendingUsers.delete(token);

            // =========================
            // ไปหน้า verify.html
            // =========================

            res.redirect("/verify.html?status=success");
        }
    );
});

// =========================
// LOGIN
// =========================

app.post("/login", (req, res) => {

    const {
        username,
        password
    } = req.body;

    if (!username || !password) {

        return res.status(400).json({
            success: false,
            message:
                "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน"
        });
    }

    const sql = `
        SELECT
            USER_ID,
            USER_USERNAME,
            USER_FNAME,
            USER_LNAME,
            USER_PASSWORD,
            USER_EMAIL_VERIFIED
        FROM \`user\`
        WHERE USER_USERNAME = ?
    `;

    db.query(
        sql,
        [username],
        async (err, results) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message:
                        "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"
                });
            }

            if (results.length === 0) {

                return res.status(401).json({
                    success: false,
                    message:
                        "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
                });
            }

            const user =
                results[0];

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.USER_PASSWORD
                );

            if (!passwordMatch) {

                return res.status(401).json({
                    success: false,
                    message:
                        "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
                });
            }

            if (
                Number(
                    user.USER_EMAIL_VERIFIED
                ) !== 1
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ"
                });
            }

            req.session.user = {
                id: user.USER_ID,
                username:
                    user.USER_USERNAME,
                fname:
                    user.USER_FNAME,
                lname:
                    user.USER_LNAME
            };

            res.json({
                success: true,
                message:
                    "เข้าสู่ระบบสำเร็จ"
            });
        }
    );
});

// =========================
// CHECK LOGIN
// =========================

app.get("/me", (req, res) => {

    if (!req.session.user) {

        return res.json({
            loggedIn: false
        });
    }

    res.json({
        loggedIn: true,
        user: req.session.user
    });
});

// =========================
// LOGOUT
// =========================

app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message:
                    "ออกจากระบบไม่สำเร็จ"
            });
        }

        res.json({
            success: true,
            message:
                "ออกจากระบบสำเร็จ"
        });
    });
});

// =====================================================
// REVIEW SUMMARY
// =====================================================

app.get(
    "/places/:id/review-summary",
    (req, res) => {

        const placeId =
            req.params.id;

        const sql = `
            SELECT
                ROUND(
                    AVG(REVIEW_RATING),
                    1
                ) AS AVERAGE_RATING,

                COUNT(*) AS REVIEW_COUNT

            FROM review

            WHERE PLACE_ID = ?
        `;

        db.query(
            sql,
            [placeId],
            (err, results) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        error:
                            err.message
                    });
                }

                res.json(results[0]);
            }
        );
    }
);

// =====================================================
// CHECK FAVORITE
// =====================================================

app.get(
    "/favorites/:placeId/check",
    (req, res) => {

        if (!req.session.user) {

            return res.json({
                isFavorite: false
            });
        }

        const userId =
            req.session.user.id;

        const placeId =
            req.params.placeId;

        const sql = `
            SELECT FAVORITE_ID
            FROM favorite
            WHERE USER_ID = ?
            AND PLACE_ID = ?
        `;

        db.query(
            sql,
            [userId, placeId],
            (err, results) => {

                if (err) {

                    console.log(
                        "CHECK FAVORITE ERROR:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            err.message
                    });
                }

                res.json({
                    isFavorite:
                        results.length > 0
                });
            }
        );
    }
);

// =====================================================
// GET FAVORITES
// =====================================================

app.get("/favorites", (req, res) => {

    if (!req.session.user) {

        return res.status(401).json({
            success: false,
            message:
                "กรุณาเข้าสู่ระบบก่อน"
        });
    }

    const userId =
        req.session.user.id;

    const sql = `
        SELECT
            P.PLACE_ID,
            P.PLACE_NAME,
            P.PLACE_DESCRIPTION,
            P.PLACE_ADDRESS,
            F.FAVORITE_ID

        FROM favorite F

        JOIN place P
            ON F.PLACE_ID = P.PLACE_ID

        WHERE F.USER_ID = ?

        ORDER BY F.FAVORITE_ID DESC
    `;

    db.query(
        sql,
        [userId],
        (err, results) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message:
                        err.message
                });
            }

            res.json(results);
        }
    );
});

// =====================================================
// ADD FAVORITE
// =====================================================

app.post(
    "/favorites/:placeId",
    (req, res) => {

        if (!req.session.user) {

            return res.status(401).json({
                success: false,
                message:
                    "กรุณาเข้าสู่ระบบก่อน"
            });
        }

        const userId =
            req.session.user.id;

        const placeId =
            req.params.placeId;

        const checkSql = `
            SELECT FAVORITE_ID
            FROM favorite
            WHERE USER_ID = ?
            AND PLACE_ID = ?
        `;

        db.query(
            checkSql,
            [userId, placeId],
            (err, results) => {

                if (err) {

                    return res.status(500).json({
                        success: false,
                        message:
                            err.message
                    });
                }

                if (results.length > 0) {

                    return res.json({
                        success: false,
                        message:
                            "สถานที่นี้อยู่ในรายการโปรดแล้ว"
                    });
                }

                const insertSql = `
                    INSERT INTO favorite
                    (
                        FAVORITE_ID,
                        USER_ID,
                        PLACE_ID
                    )
                    VALUES
                    (
                        (
                            SELECT
                                COALESCE(
                                    MAX(FAVORITE_ID),
                                    0
                                ) + 1
                            FROM favorite AS F2
                        ),
                        ?,
                        ?
                    )
                `;

                db.query(
                    insertSql,
                    [userId, placeId],
                    (err, result) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({
                                success: false,
                                message:
                                    err.message
                            });
                        }

                        res.json({
                            success: true,
                            message:
                                "เพิ่มรายการโปรดสำเร็จ"
                        });
                    }
                );
            }
        );
    }
);

// =====================================================
// DELETE FAVORITE
// =====================================================

app.delete(
    "/favorites/:placeId",
    (req, res) => {

        if (!req.session.user) {

            return res.status(401).json({
                success: false,
                message:
                    "กรุณาเข้าสู่ระบบก่อน"
            });
        }

        const userId =
            req.session.user.id;

        const placeId =
            req.params.placeId;

        const sql = `
            DELETE FROM favorite
            WHERE USER_ID = ?
            AND PLACE_ID = ?
        `;

        db.query(
            sql,
            [userId, placeId],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        success: false,
                        message:
                            err.message
                    });
                }

                res.json({
                    success: true,
                    message:
                        "ลบรายการโปรดแล้ว"
                });
            }
        );
    }
);

// =========================
// PLACES
// =========================

// GET ALL PLACES

app.get("/places", (req, res) => {

    const sql = `
        SELECT
            P.PLACE_ID,
            P.PLACE_NAME,
            P.PLACE_DESCRIPTION,
            P.PLACE_ADDRESS,

            P.TYPE_ID AS TYPE_ID,
            P.MOOD_ID AS MOOD_ID,

            C.COST_ENTRANCE_FEE,
            C.COST_AVERAGE,
            I.IMAGE_URL

        FROM place P

        LEFT JOIN cost C
            ON P.COST_ID = C.COST_ID

        LEFT JOIN \`image\` I
            ON P.PLACE_ID = I.PLACE_ID

        ORDER BY P.PLACE_ID
    `;

    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.log(
                    "GET PLACES ERROR:",
                    err
                );

                return res.status(500).json({
                    error:
                        err.message
                });
            }

            res.json(results);
        }
    );
});

// =========================
// GET PLACE BY ID
// =========================

app.get(
    "/places/:id",
    (req, res) => {

        const placeId =
            req.params.id;

        const sql = `
            SELECT
                P.PLACE_ID,
                P.PLACE_NAME,
                P.PLACE_DESCRIPTION,
                P.PLACE_ADDRESS,

                P.TYPE_ID AS TYPE_ID,
                P.MOOD_ID AS MOOD_ID,

                C.COST_ENTRANCE_FEE,
                C.COST_AVERAGE,
                I.IMAGE_URL

            FROM place P

            LEFT JOIN cost C
                ON P.COST_ID = C.COST_ID

            LEFT JOIN \`image\` I
                ON P.PLACE_ID = I.PLACE_ID

            WHERE P.PLACE_ID = ?
        `;

        db.query(
            sql,
            [placeId],
            (err, results) => {

                if (err) {

                    console.log(
                        "GET PLACE ERROR:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            err.message
                    });
                }

                if (results.length === 0) {

                    return res.status(404).json({
                        error:
                            "ไม่พบสถานที่"
                    });
                }

                res.json(results[0]);
            }
        );
    }
);

// =========================
// GET REVIEWS
// =========================

app.get(
    "/places/:id/reviews",
    (req, res) => {

        const placeId =
            req.params.id;

        const sql = `
            SELECT
                R.USER_ID,
                U.USER_USERNAME,
                U.USER_FNAME,
                U.USER_LNAME,
                R.REVIEW_RATING,
                R.REVIEW_COMMENT,
                R.REVIEW_DATE

            FROM review R

            JOIN \`user\` U
                ON R.USER_ID = U.USER_ID

            WHERE R.PLACE_ID = ?

            ORDER BY R.REVIEW_DATE DESC
        `;

        db.query(
            sql,
            [placeId],
            (err, results) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        error:
                            err.message
                    });
                }

                res.json(results);
            }
        );
    }
);

// =========================
// ADD REVIEW
// =========================

app.post(
    "/places/:id/reviews",
    (req, res) => {

        if (!req.session.user) {

            return res.status(401).json({
                success: false,
                message:
                    "กรุณาเข้าสู่ระบบก่อนรีวิว"
            });
        }

        const placeId =
            req.params.id;

        const userId =
            req.session.user.id;

        const {
            rating,
            comment
        } = req.body;

        if (!rating) {

            return res.status(400).json({
                success: false,
                message:
                    "กรุณาให้คะแนน"
            });
        }

        const sql = `
            INSERT INTO review
            (
                USER_ID,
                PLACE_ID,
                REVIEW_RATING,
                REVIEW_COMMENT,
                REVIEW_DATE
            )
            VALUES (?, ?, ?, ?, NOW())
        `;

        db.query(
            sql,
            [
                userId,
                placeId,
                rating,
                comment || null
            ],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        success: false,
                        message:
                            err.message
                    });
                }

                res.json({
                    success: true,
                    message:
                        "เพิ่มรีวิวสำเร็จ"
                });
            }
        );
    }
);

// =========================
// START SERVER
// =========================

const PORT =
    process.env.PORT || 3000;

app.listen(
    PORT,
    () => {

        console.log(
            `เว็บไซต์เปิดที่ port ${PORT}`
        );
    }
);