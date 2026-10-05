require("dotenv").config();

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const session = require("express-session");

const app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// SESSION
// =========================

app.use(session({
    secret: "kmitl-travel-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(express.static(__dirname));

// =========================
// MySQL
// =========================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    charset: "utf8mb4"
});

db.connect((err) => {
    if (err) {
        console.log("เชื่อมต่อ MySQL ไม่สำเร็จ");
        console.log(err);
        return;
    }

    console.log("เชื่อมต่อ MySQL สำเร็จ");
});
// =========================
// EMAIL
// =========================

console.log(
    "EMAIL_USER:",
    process.env.EMAIL_USER ? "มีค่า" : "ไม่มีค่า"
);

console.log(
    "EMAIL_PASS:",
    process.env.EMAIL_PASS ? "มีค่า" : "ไม่มีค่า"
);

console.log(
    "EMAIL_USER:",
    process.env.EMAIL_USER ? "มีค่า" : "ไม่มีค่า"
);

console.log(
    "EMAIL_PASS:",
    process.env.EMAIL_PASS ? "มีค่า" : "ไม่มีค่า"
);

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
});

transporter.verify((error) => {
    if (error) {
        console.log("❌ EMAIL ERROR");
        console.log(error);
    } else {
        console.log("✅ Email server พร้อมส่ง");
    }
});

transporter.verify((error) => {

    if (error) {

        console.log("❌ EMAIL ERROR");
        console.log(error);

    } else {

        console.log("✅ Email server พร้อมส่ง");

    }

});
// =========================
// REGISTER
// =========================

app.post("/register", async (req, res) => {

    const {
        username,
        email,
        password,
        fname,
        lname
    } = req.body;


    if (!username || !email || !password || !fname || !lname) {

        return res.status(400).json({
            success: false,
            message: "กรุณากรอกข้อมูลให้ครบ"
        });

    }


    try {

        // =========================
        // CHECK USER
        // =========================

        const checkSql = `
            SELECT USER_ID
            FROM \`user\`
            WHERE USER_USERNAME = ?
               OR USER_EMAIL = ?
        `;


        db.query(
            checkSql,
            [username, email],
            async (err, results) => {

                if (err) {

                    console.log("CHECK USER ERROR:", err);

                    return res.status(500).json({
                        success: false,
                        message: "ตรวจสอบข้อมูลไม่สำเร็จ"
                    });

                }


                if (results.length > 0) {

                    return res.status(400).json({
                        success: false,
                        message: "Username หรือ Email นี้มีอยู่แล้ว"
                    });

                }


                // =========================
                // HASH PASSWORD
                // =========================

                const hashedPassword =
                    await bcrypt.hash(password, 10);


                // =========================
                // CREATE TOKEN
                // =========================

                const verifyToken =
                    crypto.randomBytes(32).toString("hex");


                // =========================
                // INSERT USER
                // =========================

                const sql = `
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
                    VALUES (?, ?, ?, ?, ?, 0, ?)
                `;


                db.query(
                    sql,
                    [
                        username,
                        email,
                        hashedPassword,
                        fname,
                        lname,
                        verifyToken
                    ],
                    async (err, result) => {

                        if (err) {

                            console.log("INSERT USER ERROR:", err);

                            return res.status(500).json({
                                success: false,
                                message: "สมัครสมาชิกไม่สำเร็จ"
                            });

                        }


                        console.log(
                            "✅ INSERT USER สำเร็จ USER_ID:",
                            result.insertId
                        );


                        // =========================
                        // VERIFY LINK
                        // =========================

                        const verifyLink =
                            `${req.protocol}://${req.get("host")}/verify?token=${verifyToken}`;


                        // =========================
                        // EMAIL
                        // =========================

                        const mailOptions = {

                            from:
                                `"เที่ยวไหนดี สจล." <${process.env.EMAIL_USER}>`,

                            to: email,

                            subject:
                                "ยืนยันอีเมล - เที่ยวไหนดี สจล.",

                            html: `
                                <div
                                    style="
                                        font-family: Arial, sans-serif;
                                        max-width: 600px;
                                        margin: auto;
                                        padding: 20px;
                                    "
                                >

                                    <h2>
                                        ยืนยันอีเมล
                                    </h2>

                                    <p>
                                        ขอบคุณสำหรับการสมัครสมาชิก
                                        เว็บไซต์เที่ยวไหนดี สจล.
                                    </p>

                                    <p>
                                        กรุณากดปุ่มด้านล่าง
                                        เพื่อยืนยันอีเมลของคุณ
                                    </p>

                                    <a
                                        href="${verifyLink}"
                                        style="
                                            display: inline-block;
                                            padding: 12px 20px;
                                            background: #333;
                                            color: white;
                                            text-decoration: none;
                                            border-radius: 8px;
                                        "
                                    >
                                        ยืนยันอีเมล
                                    </a>

                                    <p style="margin-top:20px;">
                                        หากคุณไม่ได้สมัครสมาชิก
                                        สามารถละเว้นอีเมลนี้ได้
                                    </p>

                                </div>
                            `
                        };


                        // =========================
                        // SEND EMAIL
                        // =========================

                        console.log(
                            "📧 กำลังส่ง Email ไปที่:",
                            email
                        );


                        try {

                            const info =
                                await transporter.sendMail(mailOptions);


                            console.log(
                                "✅ ส่ง Email สำเร็จ:",
                                email
                            );

                            console.log(
                                "Message ID:",
                                info.messageId
                            );


                            res.json({

                                success: true,

                                message:
                                    "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยัน"

                            });


                        } catch (emailError) {

                            console.log(
                                "❌ ส่ง Email ไม่สำเร็จ"
                            );

                            console.log(emailError);


                            // =========================
                            // DELETE USER
                            // ถ้าส่งเมลไม่ได้
                            // =========================

                            db.query(
                                `
                                DELETE FROM \`user\`
                                WHERE USER_ID = ?
                                `,
                                [result.insertId],
                                (deleteErr) => {

                                    if (deleteErr) {

                                        console.log(
                                            "DELETE USER ERROR:",
                                            deleteErr
                                        );

                                    } else {

                                        console.log(
                                            "🗑️ ลบ User เพราะส่ง Email ไม่สำเร็จ"
                                        );

                                    }

                                }
                            );


                            return res.status(500).json({

                                success: false,

                                message:
                                    "ส่งอีเมลไม่สำเร็จ กรุณาตรวจสอบการตั้งค่า Gmail"

                            });

                        }

                    }
                );

            }
        );

    } catch (error) {

        console.log("REGISTER ERROR:", error);

        return res.status(500).json({

            success: false,

            message:
                "เกิดข้อผิดพลาดในการสมัครสมาชิก"

        });

    }
});
// =========================
// VERIFY EMAIL
// =========================

app.get("/verify", (req, res) => {

    const token = req.query.token;

    if (!token) {
        return res.send(`
            <h2>ลิงก์ยืนยันไม่ถูกต้อง</h2>
        `);
    }

    const sql = `
        SELECT USER_ID
        FROM \`user\`
        WHERE USER_VERIFY_TOKEN = ?
    `;

    db.query(
        sql,
        [token],
        (err, results) => {

            if (err) {
                console.log(err);

                return res.status(500).send(`
                    <h2>เกิดข้อผิดพลาด</h2>
                `);
            }

            if (results.length === 0) {
                return res.send(`
                    <h2>ลิงก์ยืนยันไม่ถูกต้องหรือถูกใช้ไปแล้ว</h2>
                `);
            }

            const userId = results[0].USER_ID;

            const updateSql = `
                UPDATE \`user\`
                SET
                    USER_EMAIL_VERIFIED = 1,
                    USER_VERIFY_TOKEN = NULL
                WHERE USER_ID = ?
            `;

            db.query(
                updateSql,
                [userId],
                (err) => {

                    if (err) {
                        console.log(err);

                        return res.status(500).send(`
                            <h2>ยืนยันอีเมลไม่สำเร็จ</h2>
                        `);
                    }

                    res.redirect("/verify.html");
                }
            );
        }
    );
});

// =========================
// LOGIN
// =========================

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน"
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

    db.query(sql, [username], async (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
            });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.USER_PASSWORD
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
            });
        }

        if (Number(user.USER_EMAIL_VERIFIED) !== 1) {
            return res.status(403).json({
                success: false,
                message: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ"
            });
        }

        req.session.user = {
            id: user.USER_ID,
            username: user.USER_USERNAME,
            fname: user.USER_FNAME,
            lname: user.USER_LNAME
        };

        res.json({
            success: true,
            message: "เข้าสู่ระบบสำเร็จ"
        });
    });
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
                message: "ออกจากระบบไม่สำเร็จ"
            });
        }

        res.json({
            success: true,
            message: "ออกจากระบบสำเร็จ"
        });
    });
});

// =====================================================
// REVIEW SUMMARY
// =====================================================

app.get("/places/:id/review-summary", (req, res) => {

    const placeId = req.params.id;

    const sql = `
        SELECT
            ROUND(AVG(REVIEW_RATING), 1) AS AVERAGE_RATING,
            COUNT(*) AS REVIEW_COUNT
        FROM review
        WHERE PLACE_ID = ?
    `;

    db.query(sql, [placeId], (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results[0]);
    });
});

// =====================================================
// CHECK FAVORITE
// =====================================================

app.get("/favorites/:placeId/check", (req, res) => {

    if (!req.session.user) {
        return res.json({
            isFavorite: false
        });
    }

    const userId = req.session.user.id;
    const placeId = req.params.placeId;

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
                console.log("CHECK FAVORITE ERROR:", err);

                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                isFavorite: results.length > 0
            });
        }
    );
});

// =====================================================
// GET FAVORITES
// =====================================================

app.get("/favorites", (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "กรุณาเข้าสู่ระบบก่อน"
        });
    }

    const userId = req.session.user.id;

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

    db.query(sql, [userId], (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json(results);
    });
});

// =====================================================
// ADD FAVORITE
// =====================================================

app.post("/favorites/:placeId", (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "กรุณาเข้าสู่ระบบก่อน"
        });
    }

    const userId = req.session.user.id;
    const placeId = req.params.placeId;

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
                    message: err.message
                });
            }

            if (results.length > 0) {
                return res.json({
                    success: false,
                    message: "สถานที่นี้อยู่ในรายการโปรดแล้ว"
                });
            }

            const insertSql = `
                INSERT INTO favorite
                (
                    FAVORITE_ID,
                    USER_ID,
                    PLACE_ID
                )
                VALUES (
                    (
                        SELECT COALESCE(MAX(FAVORITE_ID), 0) + 1
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
                            message: err.message
                        });
                    }

                    res.json({
                        success: true,
                        message: "เพิ่มรายการโปรดสำเร็จ"
                    });
                }
            );
        }
    );
});

// =====================================================
// DELETE FAVORITE
// =====================================================

app.delete("/favorites/:placeId", (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "กรุณาเข้าสู่ระบบก่อน"
        });
    }

    const userId = req.session.user.id;
    const placeId = req.params.placeId;

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
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: "ลบรายการโปรดแล้ว"
            });
        }
    );
});

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
            C.COST_ENTRANCE_FEE,
            C.COST_AVERAGE,
            T.TRANSPORT_TYPE,
            T.TRANSPORT_DESCRIPTION,
            T.TRANSPORT_COST,
            I.IMAGE_URL
        FROM place P

        LEFT JOIN cost C
            ON P.COST_ID = C.COST_ID

        LEFT JOIN transport T
            ON P.TRANSPORT_ID = T.TRANSPORT_ID

        LEFT JOIN \`image\` I
            ON P.PLACE_ID = I.PLACE_ID

        ORDER BY P.PLACE_ID
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("GET PLACES ERROR:", err);

            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
});

// =========================
// GET PLACE BY ID
// =========================

app.get("/places/:id", (req, res) => {

    const placeId = req.params.id;

    const sql = `
        SELECT
            P.PLACE_ID,
            P.PLACE_NAME,
            P.PLACE_DESCRIPTION,
            P.PLACE_ADDRESS,
            C.COST_ENTRANCE_FEE,
            C.COST_AVERAGE,
            T.TRANSPORT_TYPE,
            T.TRANSPORT_DESCRIPTION,
            T.TRANSPORT_COST,
            I.IMAGE_URL
        FROM place P

        LEFT JOIN cost C
            ON P.COST_ID = C.COST_ID

        LEFT JOIN transport T
            ON P.TRANSPORT_ID = T.TRANSPORT_ID

        LEFT JOIN \`image\` I
            ON P.PLACE_ID = I.PLACE_ID

        WHERE P.PLACE_ID = ?
    `;

    db.query(sql, [placeId], (err, results) => {

        if (err) {
            console.log("GET PLACE ERROR:", err);

            return res.status(500).json({
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                error: "ไม่พบสถานที่"
            });
        }

        res.json(results[0]);
    });
});

// =========================
// GET REVIEWS
// =========================

app.get("/places/:id/reviews", (req, res) => {

    const placeId = req.params.id;

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

    db.query(sql, [placeId], (err, results) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
});

// =========================
// ADD REVIEW
// =========================

app.post("/places/:id/reviews", (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "กรุณาเข้าสู่ระบบก่อนรีวิว"
        });
    }

    const placeId = req.params.id;
    const userId = req.session.user.id;

    const {
        rating,
        comment
    } = req.body;

    if (!rating) {
        return res.status(400).json({
            success: false,
            message: "กรุณาให้คะแนน"
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
        [userId, placeId, rating, comment || null],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: "เพิ่มรีวิวสำเร็จ"
            });
        }
    );
});

// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`เว็บไซต์เปิดที่ port ${PORT}`);
});