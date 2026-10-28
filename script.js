/* JavaScript ฝั่งเบราว์เซอร์: ควบคุมการเปลี่ยนหน้า ค้นหา/แสดงสถานที่ รายการโปรด รีวิว การเข้าสู่ระบบ และการวางแผนเดินทาง */
console.log("script.js ทำงานแล้ว");

let currentPlace = null;


// =====================================================
// SHOW MESSAGE
// =====================================================

// แสดงข้อความแจ้งเตือนแก่ผู้ใช้ผ่านกล่อง alert โดยใช้ข้อความที่ส่งเข้ามา หรือข้อความต้อนรับเมื่อไม่ได้ส่งข้อความ
// อธิบายการทำงาน: แสดงข้อความแจ้งเตือนให้ผู้ใช้ผ่าน alert โดยรับข้อความจากจุดที่เรียกใช้ หากส่งค่าว่างหรือ undefined จะใช้ข้อความต้อนรับเริ่มต้น ฟังก์ชันนี้ไม่ส่งข้อมูลไปเซิร์ฟเวอร์
function showMessage(message) {
    alert(
        message || "ยินดีต้อนรับเข้าสู่เว็บไซต์!"
    );
}


// =====================================================
// TOGGLE PASSWORD
// =====================================================

// สลับช่องรหัสผ่านระหว่าง type=password (ซ่อนตัวอักษร) และ type=text (แสดงตัวอักษร) พร้อมเปลี่ยนไอคอนตา
// อธิบายการทำงาน: สลับการมองเห็นรหัสผ่านของช่อง input ที่ระบุด้วย id: password คือซ่อนข้อความ และ text คือแสดงข้อความ จากนั้นเปลี่ยน class ของไอคอนให้ตรงกับสถานะ
function togglePassword(id, button) {
    const input = document.getElementById(id);
    const icon = button.querySelector("i");

    if (input.type === "password") {
        input.type = "text";

        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");

    } else {
        input.type = "password";

        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}


// =====================================================
// PAGE HISTORY
// =====================================================

// บันทึกสถานะหน้าไว้ใน browser history ด้วย pushState เพื่อให้ปุ่มย้อนกลับ/เดินหน้าและ URL hash สอดคล้องกับหน้าที่เปิด
// อธิบายการทำงาน: บันทึกสถานะการนำทางลง browser history ด้วย pushState พร้อมใส่ page และข้อมูลเพิ่มเติม (data) ลง state และปรับ hash ของ URL เพื่อช่วยรองรับการย้อนกลับ/รีเฟรชตามโครงสร้างเว็บ
function savePageState(page, data = {}) {
    // pushState เพิ่ม state ใหม่ในประวัติการนำทางโดยไม่โหลดเอกสารใหม่
    // เพิ่มรายการลงประวัติการนำทางของเบราว์เซอร์ โดยไม่โหลดเอกสารใหม่
    history.pushState(
        {
            page: page,
            ...data
        },
        "",
        "#" + page
    );
}


// =====================================================
// SHOW HOME
// =====================================================

// แสดงหน้าหลักและซ่อนส่วนหน้าอื่น โดย fromHistory ใช้แยกกรณีที่เรียกจากประวัติการนำทาง
// อธิบายการทำงาน: กลับไปแสดงหน้าแรก: ถ้าไม่ได้ถูกเรียกจากการคืนค่าประวัติ จะเพิ่ม home ลง history แล้วซ่อนพื้นที่หน้าอื่นก่อนเปิดเนื้อหาหลัก
function showHome(fromHistory = false) {

    if (!fromHistory) {
        savePageState("home");
    }

    const hero =
        document.querySelector(".hero");

    if (hero) {
        hero.style.display = "flex";
    }

    document.querySelectorAll(".content").forEach(section => {
        section.style.display = "none";
    });

    const typesPage =
        document.getElementById("typesPage");

    if (typesPage) {
        typesPage.style.display = "none";
    }

    const moodsPage =
        document.getElementById("moodsPage");

    if (moodsPage) {
        moodsPage.style.display = "none";
    }

    const placesPage =
        document.getElementById("placesPage");

    if (placesPage) {
        placesPage.style.display = "none";
    }

    const favoritesPage =
        document.getElementById("favoritesPage");

    if (favoritesPage) {
        favoritesPage.style.display = "none";
    }

    const aboutPage =
        document.getElementById("aboutPage");

    if (aboutPage) {
        aboutPage.style.display = "none";
    }

    const detailPage =
        document.getElementById("detailPage");

    if (detailPage) {
        detailPage.style.display = "none";
    }

    const homeContent =
        document.querySelector(
            ".content:not(#placesPage):not(#aboutPage):not(#typesPage):not(#moodsPage):not(#favoritesPage):not(#detailPage)"
        );

    if (homeContent) {
        homeContent.style.display = "block";
    }
}


// =====================================================
// SEARCH
// =====================================================

// ค้นหาคำที่ผู้ใช้พิมพ์ในรายการการ์ดสถานที่ที่มีอยู่ แล้วแสดงเฉพาะการ์ดที่ตรงกัน
// อธิบายการทำงาน: ค้นหาจากการ์ดสถานที่ที่อยู่ใน DOM โดยอ่านคำค้น ตัดช่องว่าง แปลงเป็นตัวพิมพ์เล็ก แล้วเทียบกับข้อความในการ์ดที่มีอยู่ หากไม่มีคำค้นจะแจ้งเตือนและหยุด
function searchPlace() {

    const input =
        document.getElementById("searchInput");

    if (!input) {
        return;
    }

    const keyword =
        input.value.trim().toLowerCase();

    if (keyword === "") {

        alert(
            "กรุณาพิมพ์ชื่อสถานที่"
        );

        return;
    }

    savePageState("search", {
        keyword: keyword
    });

    const places =
        document.querySelectorAll(
            "#placeCards .card"
        );

    let found = false;

    places.forEach(card => {

        const text =
            card.innerText.toLowerCase();

        if (text.includes(keyword)) {

            card.style.display = "block";

            found = true;

        } else {

            card.style.display = "none";

        }

    });

    const hero =
        document.querySelector(".hero");

    if (hero) {
        hero.style.display = "none";
    }

    document.querySelectorAll(".content").forEach(section => {
        section.style.display = "none";
    });

    const typesPage =
        document.getElementById("typesPage");

    if (typesPage) {
        typesPage.style.display = "none";
    }

    const moodsPage =
        document.getElementById("moodsPage");

    if (moodsPage) {
        moodsPage.style.display = "none";
    }

    const favoritesPage =
        document.getElementById("favoritesPage");

    if (favoritesPage) {
        favoritesPage.style.display = "none";
    }

    const aboutPage =
        document.getElementById("aboutPage");

    if (aboutPage) {
        aboutPage.style.display = "none";
    }

    const detailPage =
        document.getElementById("detailPage");

    if (detailPage) {
        detailPage.style.display = "none";
    }

    const placesPage =
        document.getElementById("placesPage");

    if (placesPage) {
        placesPage.style.display = "block";
    }

    if (!found) {

        document.getElementById("placeCards").innerHTML =
            "<p>ไม่พบสถานที่ที่ค้นหา</p>";

    }

}


// =====================================================
// SHOW PLACES
// =====================================================

// โหลดรายการสถานที่จาก API /places (และอาจกรองตาม TYPE_ID) ก่อนสร้างการ์ดให้คลิกเปิดรายละเอียดได้
// อธิบายการทำงาน: แสดงหน้ารายการสถานที่และอาจกรองตามประเภทที่ได้รับ จากนั้นโหลด/เตรียมการ์ดและจัดการการแสดงส่วนที่เกี่ยวข้อง
async function showPlaces(
    typeId = null,
    fromHistory = false
) {

    if (!fromHistory) {

        savePageState("places", {
            typeId: typeId
        });

    }

    const hero =
        document.querySelector(".hero");

    if (hero) {
        hero.style.display = "none";
    }

    document.querySelectorAll(".content").forEach(section => {
        section.style.display = "none";
    });

    const typesPage =
        document.getElementById("typesPage");

    if (typesPage) {
        typesPage.style.display = "none";
    }

    const moodsPage =
        document.getElementById("moodsPage");

    if (moodsPage) {
        moodsPage.style.display = "none";
    }

    const favoritesPage =
        document.getElementById("favoritesPage");

    if (favoritesPage) {
        favoritesPage.style.display = "none";
    }

    const aboutPage =
        document.getElementById("aboutPage");

    if (aboutPage) {
        aboutPage.style.display = "none";
    }

    const detailPage =
        document.getElementById("detailPage");

    if (detailPage) {
        detailPage.style.display = "none";
    }

    const placesPage =
        document.getElementById("placesPage");

    if (placesPage) {
        placesPage.style.display = "block";
    }

    const backButton =
        document.getElementById("placesBackButton");

    if (backButton) {

        if (typeId) {

            backButton.innerText =
                "← กลับประเภท";

            backButton.dataset.from =
                "types";

        } else {

            backButton.innerText =
                "← กลับหน้าหลัก";

            backButton.dataset.from =
                "home";

        }

    }

    const placesTitle =
        document.getElementById("placesTitle");

    if (placesTitle) {
        placesTitle.innerText =
            "สถานที่";
    }

    try {

        const response =
            await fetch("/places");

        if (!response.ok) {
            throw new Error(
                "โหลดสถานที่ไม่สำเร็จ"
            );
        }

        const places =
            await response.json();

        const container =
            document.getElementById("placeCards");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        let filteredPlaces =
            places;

        if (typeId) {

            filteredPlaces =
                places.filter(place =>
                    Number(place.TYPE_ID) ===
                    Number(typeId)
                );

        }

        filteredPlaces.forEach(place => {

            const card =
                document.createElement("div");

            card.className =
                "card";

            card.innerHTML = `

                <div class="icon">
                    📍
                </div>

                <h3>
                    ${place.PLACE_NAME}
                </h3>

                <p>
                    ${place.PLACE_DESCRIPTION || ""}
                </p>

                <p>
                    📍 ${place.PLACE_ADDRESS || ""}
                </p>

            `;

            card.onclick =
                function () {

                    showPlaceDetail(
                        place.PLACE_ID
                    );

                };

            container.appendChild(
                card
            );

        });

        if (filteredPlaces.length === 0) {

            container.innerHTML =
                "<p>ยังไม่มีสถานที่ในประเภทนี้</p>";

        }

    } catch (error) {

        console.error(
            "โหลดข้อมูลไม่สำเร็จ:",
            error
        );

    }

}


// =====================================================
// SHOW TYPES
// =====================================================

// แสดงหน้ารายการประเภทสถานที่ และซ่อนหน้าอื่น
// อธิบายการทำงาน: แสดงหน้าเลือกประเภทสถานที่ โดยจัดการสถานะการแสดงผลของ section และข้อมูลประเภทตามขั้นตอนในฟังก์ชัน
function showTypes(
    fromHistory = false
) {

    if (!fromHistory) {
        savePageState("types");
    }

    const hero =
        document.querySelector(".hero");

    if (hero) {
        hero.style.display = "none";
    }

    document.querySelectorAll(".content").forEach(section => {
        section.style.display = "none";
    });

    const moodsPage =
        document.getElementById("moodsPage");

    if (moodsPage) {
        moodsPage.style.display = "none";
    }

    const placesPage =
        document.getElementById("placesPage");

    if (placesPage) {
        placesPage.style.display = "none";
    }

    const favoritesPage =
        document.getElementById("favoritesPage");

    if (favoritesPage) {
        favoritesPage.style.display = "none";
    }

    const aboutPage =
        document.getElementById("aboutPage");

    if (aboutPage) {
        aboutPage.style.display = "none";
    }

    const detailPage =
        document.getElementById("detailPage");

    if (detailPage) {
        detailPage.style.display = "none";
    }

    const typesPage =
        document.getElementById("typesPage");

    if (typesPage) {
        typesPage.style.display = "block";
    }

}


// =====================================================
// SHOW MOODS
// =====================================================

// แสดงหน้ารายการบรรยากาศ/อารมณ์ และซ่อนหน้าอื่น
// อธิบายการทำงาน: แสดงหน้าเลือกสถานที่ตามอารมณ์ (Mood) และจัดการพื้นที่หน้าเว็บที่ต้องซ่อนหรือแสดง
function showMoods(
    fromHistory = false
) {

    if (!fromHistory) {
        savePageState("moods");
    }

    const hero =
        document.querySelector(".hero");

    if (hero) {
        hero.style.display = "none";
    }

    document.querySelectorAll(".content").forEach(section => {
        section.style.display = "none";
    });

    const typesPage =
        document.getElementById("typesPage");

    if (typesPage) {
        typesPage.style.display = "none";
    }

    const placesPage =
        document.getElementById("placesPage");

    if (placesPage) {
        placesPage.style.display = "none";
    }

    const favoritesPage =
        document.getElementById("favoritesPage");

    if (favoritesPage) {
        favoritesPage.style.display = "none";
    }

    const aboutPage =
        document.getElementById("aboutPage");

    if (aboutPage) {
        aboutPage.style.display = "none";
    }

    const detailPage =
        document.getElementById("detailPage");

    if (detailPage) {
        detailPage.style.display = "none";
    }

    const moodsPage =
        document.getElementById("moodsPage");

    if (moodsPage) {
        moodsPage.style.display = "block";
    }

}


// =====================================================
// SHOW ABOUT
// =====================================================

// แสดงหน้าเกี่ยวกับโครงงานและซ่อนหน้าอื่น
// อธิบายการทำงาน: เปิดส่วนเกี่ยวกับเว็บไซต์ พร้อมจัดการการแสดงผลหน้าอื่นเพื่อไม่ให้เนื้อหาซ้อนกัน
function showAbout(
    fromHistory = false
) {

    if (!fromHistory) {
        savePageState("about");
    }

    const hero =
        document.querySelector(".hero");

    if (hero) {
        hero.style.display = "none";
    }

    document.querySelectorAll(".content").forEach(section => {
        section.style.display = "none";
    });

    const typesPage =
        document.getElementById("typesPage");

    if (typesPage) {
        typesPage.style.display = "none";
    }

    const moodsPage =
        document.getElementById("moodsPage");

    if (moodsPage) {
        moodsPage.style.display = "none";
    }

    const placesPage =
        document.getElementById("placesPage");

    if (placesPage) {
        placesPage.style.display = "none";
    }

    const favoritesPage =
        document.getElementById("favoritesPage");

    if (favoritesPage) {
        favoritesPage.style.display = "none";
    }

    const detailPage =
        document.getElementById("detailPage");

    if (detailPage) {
        detailPage.style.display = "none";
    }

    const aboutPage =
        document.getElementById("aboutPage");

    if (aboutPage) {
        aboutPage.style.display = "block";
    }

}


// =====================================================
// SHOW MOOD PLACES
// =====================================================

// แสดงสถานที่ที่ตรงกับบรรยากาศที่เลือก
// อธิบายการทำงาน: แสดงสถานที่ตาม Mood ที่เลือก โดยโหลด/กรองข้อมูลตามเงื่อนไขของฟังก์ชันและแสดงผลเป็นรายการ
async function showMoodPlaces(
    moodId,
    fromHistory = false
) {

    if (!fromHistory) {

        savePageState("moodPlaces", {
            moodId: moodId
        });

    }

    const hero =
        document.querySelector(".hero");

    if (hero) {
        hero.style.display = "none";
    }

    document.querySelectorAll(".content").forEach(section => {
        section.style.display = "none";
    });

    const typesPage =
        document.getElementById("typesPage");

    if (typesPage) {
        typesPage.style.display = "none";
    }

    const moodsPage =
        document.getElementById("moodsPage");

    if (moodsPage) {
        moodsPage.style.display = "none";
    }

    const favoritesPage =
        document.getElementById("favoritesPage");

    if (favoritesPage) {
        favoritesPage.style.display = "none";
    }

    const aboutPage =
        document.getElementById("aboutPage");

    if (aboutPage) {
        aboutPage.style.display = "none";
    }

    const detailPage =
        document.getElementById("detailPage");

    if (detailPage) {
        detailPage.style.display = "none";
    }

    const placesPage =
        document.getElementById("placesPage");

    if (placesPage) {
        placesPage.style.display = "block";
    }

    const backButton =
        document.getElementById("placesBackButton");

    if (backButton) {

        backButton.innerText =
            "← กลับบรรยากาศ";

        backButton.dataset.from =
            "moods";

    }

    const placesTitle =
        document.getElementById("placesTitle");

    if (placesTitle) {
        placesTitle.innerText =
            "สถานที่";
    }

    try {

        const response =
            await fetch("/places");

        if (!response.ok) {
            throw new Error(
                "โหลดสถานที่ไม่สำเร็จ"
            );
        }

        const places =
            await response.json();

        const container =
            document.getElementById("placeCards");

        if (!container) {
            return;
        }

        container.innerHTML = "";

        const filteredPlaces =
            places.filter(place =>
                Number(place.MOOD_ID) ===
                Number(moodId)
            );

        filteredPlaces.forEach(place => {

            const card =
                document.createElement("div");

            card.className =
                "card";

            card.innerHTML = `

                <div class="icon">
                    📍
                </div>

                <h3>
                    ${place.PLACE_NAME}
                </h3>

                <p>
                    ${place.PLACE_DESCRIPTION || ""}
                </p>

                <p>
                    📍 ${place.PLACE_ADDRESS || ""}
                </p>

            `;

            card.onclick =
                function () {

                    showPlaceDetail(
                        place.PLACE_ID
                    );

                };

            container.appendChild(
                card
            );

        });

        if (filteredPlaces.length === 0) {

            container.innerHTML = `
                <p style="grid-column: 1 / -1;">
                    ยังไม่มีสถานที่ในบรรยากาศนี้
                </p>
            `;

        }

    } catch (error) {

        console.error(
            "โหลดข้อมูลสถานที่ไม่สำเร็จ:",
            error
        );

        const container =
            document.getElementById(
                "placeCards"
            );

        if (container) {

            container.innerHTML = `
                <p style="grid-column: 1 / -1;">
                    ไม่สามารถโหลดข้อมูลสถานที่ได้
                </p>
            `;

        }

    }

}


// =====================================================
// PLACE DETAIL
// =====================================================

// ขอข้อมูลสถานที่รายตัวจากเซิร์ฟเวอร์ แล้วเติมรายละเอียด คะแนน และส่วนรีวิวในหน้ารายละเอียด
// อธิบายการทำงาน: เปิดหน้ารายละเอียดสถานที่จาก placeId โดยขอข้อมูลจาก API แล้วนำข้อมูลที่ได้รับไปอัปเดตองค์ประกอบหน้าเว็บ รวมถึงส่วนสรุปที่เกี่ยวข้อง
async function showPlaceDetail(
    placeId,
    fromHistory = false,
    returnPage = null
) {

    if (!fromHistory) {

        const previousState =
            history.state;

        savePageState(
            "detail",
            {
                placeId: placeId,

                returnPage:
                    returnPage ||
                    previousState?.page ||
                    "home",

                returnTypeId:
                    previousState?.typeId ||
                    null,

                returnMoodId:
                    previousState?.moodId ||
                    null
            }
        );

    }

    const hero =
        document.querySelector(".hero");

    if (hero) {
        hero.style.display = "none";
    }

    document.querySelectorAll(".content").forEach(section => {
        section.style.display = "none";
    });

    const typesPage =
        document.getElementById("typesPage");

    if (typesPage) {
        typesPage.style.display = "none";
    }

    const moodsPage =
        document.getElementById("moodsPage");

    if (moodsPage) {
        moodsPage.style.display = "none";
    }

    const placesPage =
        document.getElementById("placesPage");

    if (placesPage) {
        placesPage.style.display = "none";
    }

    const favoritesPage =
        document.getElementById("favoritesPage");

    if (favoritesPage) {
        favoritesPage.style.display = "none";
    }

    const aboutPage =
        document.getElementById("aboutPage");

    if (aboutPage) {
        aboutPage.style.display = "none";
    }

    const detailPage =
        document.getElementById("detailPage");

    if (detailPage) {
        detailPage.style.display = "block";
    }

    try {

        // =============================================
        // โหลดข้อมูลสถานที่
        // =============================================

        const response =
            await fetch(
                `/places/${placeId}`
            );

        if (!response.ok) {

            throw new Error(
                "ไม่พบข้อมูลสถานที่"
            );

        }

        const place =
            await response.json();

        currentPlace = place;

        // =============================================
        // โหลดคะแนนเฉลี่ย
        // =============================================

        let summary = {

            AVERAGE_RATING: 0,

            REVIEW_COUNT: 0

        };

        try {

            const summaryResponse =
                await fetch(
                    `/places/${placeId}/review-summary`
                );

            if (summaryResponse.ok) {

                summary =
                    await summaryResponse.json();

            }

        } catch (error) {

            console.error(
                "โหลดคะแนนรีวิวไม่สำเร็จ:",
                error
            );

        }


        // =============================================
        // แสดงข้อมูล
        // =============================================

        const detail =
            document.getElementById(
                "placeDetail"
            );

        detail.innerHTML = `

            <div class="place-detail">

                ${place.IMAGE_URL ? `
                    <img
                        src="${encodeURI(place.IMAGE_URL)}"
                        alt="${place.PLACE_NAME}"
                        class="place-image"
                    >
                ` : ""}

                <!-- ชื่อสถานที่ -->

                <h1>
                    ${place.PLACE_NAME}
                </h1>


                <!-- รายการโปรด -->

                <button
                    type="button"
                    id="favoriteButton"
                    class="favorite-icon"
                    onclick="toggleFavorite(${place.PLACE_ID}); return false;"
                    aria-label="เพิ่มรายการโปรด"
                >
                    ☆
                </button>


                <!-- แท็บ -->

                <div class="detail-tabs">

                    <button
                        class="tab-button active"
                        onclick="
                            showDetailTab(
                                'info',
                                ${place.PLACE_ID}
                            )
                        "
                    >
                        ข้อมูล
                    </button>


                    <button
                        class="tab-button"
                        onclick="
                            showDetailTab(
                                'review',
                                ${place.PLACE_ID}
                            )
                        "
                    >
                        รีวิว
                    </button>

                </div>


                <!-- ================================= -->
                <!-- TAB ข้อมูล -->
                <!-- ================================= -->

                <div
                    id="infoTab"
                    class="detail-tab-content"
                >

                    <p>

                        <strong>
                            ที่อยู่ :
                        </strong>

                        ${place.PLACE_ADDRESS || "-"}

                    </p>


                    <p>

                        <strong>
                            รายละเอียด :
                        </strong>

                        ${
                            place.PLACE_DESCRIPTION ||
                            "ไม่มีรายละเอียด"
                        }

                    </p>


                    <p>

                        <strong>
                            ค่าเข้าสถานที่ :
                        </strong>

                        ${
                            place.COST_ENTRANCE_FEE ??
                            "-"
                        }
                        บาท

                    </p>


                    <p>

                        <strong>
                            ค่าใช้จ่ายเฉลี่ย :
                        </strong>

                        ${
                            place.COST_AVERAGE ??
                            "-"
                        }
                        บาท

                    </p>

<button
    type="button"
    onclick="openGoogleMaps()"
    class="transport-button"
>
    📍 นำทางด้วย Google Maps
</button>
</div>
                <!-- ================================= -->
                <!-- TAB รีวิว -->
                <!-- ================================= -->

                <div
                    id="reviewTab"
                    class="detail-tab-content"
                    style="display: none;"
                >

                    <h3>
                        รีวิวสถานที่
                    </h3>


                    <!-- คะแนนเฉลี่ย -->

                    <div id="reviewSummary">

                        <div class="review-summary">

                            <div class="average-rating">

                                ${
                                    Number(
                                        summary.AVERAGE_RATING
                                    ) || 0
                                }

                            </div>


                            <div class="average-stars">

                                ${
                                    "★".repeat(
                                        Math.round(
                                            Number(
                                                summary.AVERAGE_RATING
                                            ) || 0
                                        )
                                    )
                                }

                                ${
                                    "☆".repeat(
                                        5 -
                                        Math.round(
                                            Number(
                                                summary.AVERAGE_RATING
                                            ) || 0
                                        )
                                    )
                                }

                            </div>


                            <div class="review-count">

                                ${
                                    Number(
                                        summary.REVIEW_COUNT
                                    ) || 0
                                }

                                รีวิว

                            </div>

                        </div>

                    </div>


                    <!-- รายการรีวิว -->

                    <div id="reviewList">

                        <p>
                            กำลังโหลดรีวิว...
                        </p>

                    </div>


                    <!-- แบบฟอร์มรีวิว -->

                    <div class="review-form">

                        <h3>
                            เขียนรีวิว
                        </h3>


                        <label>
                            คะแนน
                        </label>


                        <div class="star-rating">

                            <span
                                class="star"
                                data-value="1"
                            >
                                ★
                            </span>

                            <span
                                class="star"
                                data-value="2"
                            >
                                ★
                            </span>

                            <span
                                class="star"
                                data-value="3"
                            >
                                ★
                            </span>

                            <span
                                class="star"
                                data-value="4"
                            >
                                ★
                            </span>

                            <span
                                class="star"
                                data-value="5"
                            >
                                ★
                            </span>

                        </div>


                        <input
                            type="hidden"
                            id="reviewRating"
                            value=""
                        >


                        <label>
                            ความคิดเห็น
                        </label>


                        <textarea
                            id="reviewComment"
                            placeholder="เขียนความคิดเห็นของคุณ..."
                        ></textarea>


                        <button
                            onclick="
                                submitReview(
                                    ${place.PLACE_ID}
                                )
                            "
                        >
                            ส่งรีวิว
                        </button>

                    </div>

                </div>

            </div>

        `;


        // =============================================
        // เช็กว่ามีรายการโปรดหรือไม่
        // =============================================

        checkFavorite(
            place.PLACE_ID
        );


    } catch (error) {

        console.error(
            "โหลดรายละเอียดสถานที่ไม่สำเร็จ:",
            error
        );

        document.getElementById(
            "placeDetail"
        ).innerHTML = `

            <p style="text-align: center;">

                ไม่สามารถโหลดรายละเอียดสถานที่ได้

            </p>

        `;

    }

}


// =====================================================
// FAVORITE - TOGGLE
// =====================================================

// เพิ่มหรือนำสถานที่ออกจากรายการโปรดตามสถานะปัจจุบัน
// อธิบายการทำงาน: เพิ่มหรือเอาสถานที่ออกจากรายการโปรดตามสถานะปัจจุบัน โดยติดต่อ API และอัปเดตหน้าตาปุ่ม/รายการตามผลตอบกลับ
async function toggleFavorite(placeId) {

    console.log(
        "กด Favorite แล้ว:",
        placeId
    );

    try {

        const checkResponse =
            await fetch(
                `/favorites/${placeId}/check`
            );

        const checkData =
            await checkResponse.json();


        // =============================================
        // ถ้าเป็นรายการโปรดอยู่แล้ว → ลบ
        // =============================================

        if (checkData.isFavorite) {

            const response =
                await fetch(
                    `/favorites/${placeId}`,
                    {
                        method: "DELETE"
                    }
                );

            const data =
                await response.json();


            if (response.status === 401) {

                alert(
                    "กรุณาเข้าสู่ระบบก่อน"
                );

                return;
            }


            if (data.success) {

                showMessage(
                    "ลบออกจากรายการโปรดแล้ว"
                );

                updateFavoriteButton(
                    false
                );

            } else {

                alert(
                    data.message ||
                    "ไม่สามารถลบรายการโปรดได้"
                );

            }


        // =============================================
        // ถ้ายังไม่เป็นรายการโปรด → เพิ่ม
        // =============================================

        } else {

            const response =
                await fetch(
                    `/favorites/${placeId}`,
                    {
                        method: "POST"
                    }
                );

            const data =
                await response.json();


            if (response.status === 401) {

                alert(
                    "กรุณาเข้าสู่ระบบก่อน"
                );

                return;
            }


            if (data.success) {

                showMessage(
                    "เพิ่มรายการโปรดแล้ว"
                );

                updateFavoriteButton(
                    true
                );

            } else {

                alert(
                    data.message ||
                    "ไม่สามารถเพิ่มรายการโปรดได้"
                );

            }

        }

    } catch (error) {

        console.error(
            "จัดการรายการโปรดไม่สำเร็จ:",
            error
        );

        alert(
            "ไม่สามารถจัดการรายการโปรดได้"
        );

    }

}


// =====================================================
// FAVORITE - UPDATE BUTTON
// =====================================================

// ปรับหน้าตาปุ่มรายการโปรดให้สอดคล้องกับสถานะของสถานที่
// อธิบายการทำงาน: ปรับข้อความหรือรูปลักษณ์ปุ่มรายการโปรดให้สอดคล้องกับสถานะ isFavorite ที่ได้รับ ไม่ใช่ตัวบันทึกข้อมูลถาวรด้วยตัวเอง
function updateFavoriteButton(isFavorite) {

    const button =
        document.getElementById(
            "favoriteButton"
        );

    if (!button) {
        return;
    }

    if (isFavorite) {

        button.innerText = "★";

        button.classList.add(
            "active"
        );

        button.setAttribute(
            "aria-label",
            "ลบออกจากรายการโปรด"
        );

    } else {

        button.innerText = "☆";

        button.classList.remove(
            "active"
        );

        button.setAttribute(
            "aria-label",
            "เพิ่มรายการโปรด"
        );

    }

}


// =====================================================
// FAVORITE - CHECK
// =====================================================

// ตรวจสอบว่าสถานที่ถูกบันทึกเป็นรายการโปรดหรือไม่
// อธิบายการทำงาน: ตรวจสอบว่าสถานที่ที่ระบุเป็นรายการโปรดของผู้ใช้หรือไม่ ผ่านข้อมูล/endpoint ตามที่กำหนด แล้วใช้ผลในการปรับ UI
async function checkFavorite(
    placeId
) {

    try {

        const response =
            await fetch(
                `/favorites/${placeId}/check`
            );

        if (!response.ok) {
            return;
        }

        const data =
            await response.json();

        updateFavoriteButton(
            data.isFavorite
        );

    } catch (error) {

        console.error(
            "ตรวจสอบรายการโปรดไม่สำเร็จ:",
            error
        );

    }

}


// =====================================================
// SHOW FAVORITES
// =====================================================

// โหลดและแสดงรายการสถานที่โปรดของผู้ใช้
// อธิบายการทำงาน: เปิดส่วนรายการโปรด โหลดข้อมูลที่เกี่ยวข้อง แล้วแสดงรายการสถานที่ที่ผู้ใช้บันทึกไว้
async function showFavorites(
    fromHistory = false
) {

    if (!fromHistory) {

        savePageState(
            "favorites"
        );

    }


    const hero =
        document.querySelector(".hero");

    if (hero) {
        hero.style.display = "none";
    }


    document.querySelectorAll(".content").forEach(section => {
        section.style.display = "none";
    });


    const typesPage =
        document.getElementById("typesPage");

    if (typesPage) {
        typesPage.style.display = "none";
    }


    const moodsPage =
        document.getElementById("moodsPage");

    if (moodsPage) {
        moodsPage.style.display = "none";
    }


    const placesPage =
        document.getElementById("placesPage");

    if (placesPage) {
        placesPage.style.display = "none";
    }


    const aboutPage =
        document.getElementById("aboutPage");

    if (aboutPage) {
        aboutPage.style.display = "none";
    }


    const detailPage =
        document.getElementById("detailPage");

    if (detailPage) {
        detailPage.style.display = "none";
    }


    const favoritesPage =
        document.getElementById(
            "favoritesPage"
        );

    if (!favoritesPage) {
        return;
    }


    favoritesPage.style.display =
        "block";


    const cards =
        document.getElementById(
            "favoriteCards"
        );

    if (!cards) {
        return;
    }


    cards.innerHTML =
        "<p>กำลังโหลด...</p>";


    try {

        const response =
            await fetch(
                "/favorites"
            );


        // =============================================
        // ยังไม่ได้ Login
        // =============================================

        if (response.status === 401) {

            cards.innerHTML = `

                <p>
                    กรุณาเข้าสู่ระบบก่อนดูรายการโปรด
                </p>

            `;

            return;
        }


        if (!response.ok) {

            throw new Error(
                "โหลดรายการโปรดไม่สำเร็จ"
            );

        }


        const places =
            await response.json();


        // =============================================
        // ยังไม่มีรายการโปรด
        // =============================================

        if (places.length === 0) {

            cards.innerHTML = `

                <p>
                    ยังไม่มีสถานที่ในรายการโปรด
                </p>

            `;

            return;
        }


        cards.innerHTML = "";


        // =============================================
        // แสดงรายการโปรด
        // =============================================

        places.forEach(place => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card";


            card.innerHTML = `

                <div class="icon">
                    📍
                </div>


                <h3>
                    ${place.PLACE_NAME}
                </h3>


                <p>
                    ${
                        place.PLACE_DESCRIPTION ||
                        "ไม่มีรายละเอียด"
                    }
                </p>


                <p>
                    📍
                    ${
                        place.PLACE_ADDRESS ||
                        ""
                    }
                </p>

            `;


            card.onclick =
                function () {

                    showPlaceDetail(
                        place.PLACE_ID,
                        false,
                        "favorites"
                    );

                };


            cards.appendChild(
                card
            );

        });


    } catch (error) {

        console.error(
            "โหลดรายการโปรดไม่สำเร็จ:",
            error
        );


        cards.innerHTML = `

            <p>
                เกิดข้อผิดพลาดในการโหลดรายการโปรด
            </p>

        `;

    }

}


// =====================================================
// SWITCH DETAIL TAB
// =====================================================

// สลับแท็บภายในหน้ารายละเอียด เช่น ข้อมูลและรีวิว
// อธิบายการทำงาน: สลับแท็บภายในหน้ารายละเอียด เช่น ข้อมูลสถานที่กับรีวิว และเรียกกระบวนการโหลดเนื้อหาของแท็บที่เลือก
async function showDetailTab(tab, placeId) {
    const infoTab = document.getElementById("infoTab");
    const reviewTab = document.getElementById("reviewTab");

    const detail = document.getElementById("placeDetail");
    if (!infoTab || !reviewTab || !detail) {
        console.error("ไม่พบ infoTab, reviewTab หรือ placeDetail");
        return;
    }

    const buttons = detail.querySelectorAll(".tab-button");

    if (tab === "review") {
        infoTab.style.display = "none";
        reviewTab.style.display = "block";

        buttons[0]?.classList.remove("active");
        buttons[1]?.classList.add("active");

        await Promise.all([
            loadReviewSummary(placeId),
            loadReviews(placeId)
        ]);
    } else {
        infoTab.style.display = "block";
        reviewTab.style.display = "none";

        buttons[0]?.classList.add("active");
        buttons[1]?.classList.remove("active");
    }
}


// =====================================================
// STAR RATING
// =====================================================

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.classList.contains(
                "star"
            )
        ) {
            return;
        }


        const value =
            Number(
                event.target.dataset.value
            );


        const stars =
            document.querySelectorAll(
                ".star"
            );


        stars.forEach(star => {

            const starValue =
                Number(
                    star.dataset.value
                );


            if (starValue <= value) {

                star.classList.add(
                    "active"
                );

            } else {

                star.classList.remove(
                    "active"
                );

            }

        });


        const ratingInput =
            document.getElementById(
                "reviewRating"
            );


        if (ratingInput) {

            ratingInput.value =
                value;

        }

    }
);


// =====================================================
// LOAD REVIEW SUMMARY
// =====================================================

// เรียก API เพื่อดึงคะแนนเฉลี่ยและจำนวนรีวิวของสถานที่
// อธิบายการทำงาน: เรียกข้อมูลสรุปรีวิวของสถานที่ เช่น คะแนนเฉลี่ยและจำนวนรีวิว แล้วนำผลมาแสดงในพื้นที่สรุป
async function loadReviewSummary(
    placeId
) {

    const summaryBox =
        document.getElementById(
            "reviewSummary"
        );

    if (!summaryBox) {
        return;
    }


    try {

        const response =
            await fetch(
                `/places/${placeId}/review-summary`
            );


        if (!response.ok) {

            throw new Error(
                "โหลดคะแนนไม่สำเร็จ"
            );

        }


        const summary =
            await response.json();


        const average =
            Number(
                summary.AVERAGE_RATING
            ) || 0;


        const count =
            Number(
                summary.REVIEW_COUNT
            ) || 0;


        summaryBox.innerHTML = `

            <div class="review-summary">

                <div class="average-rating">
                    ${average.toFixed(1)}
                </div>


                <div class="average-stars">

                    ${
                        "★".repeat(
                            Math.round(
                                average
                            )
                        )
                    }

                    ${
                        "☆".repeat(
                            5 -
                            Math.round(
                                average
                            )
                        )
                    }

                </div>


                <div class="review-count">
                    ${count} รีวิว
                </div>

            </div>

        `;

    } catch (error) {

        console.error(
            "โหลดคะแนนรีวิวไม่สำเร็จ:",
            error
        );


        summaryBox.innerHTML = `

            <p>
                ยังไม่มีคะแนนรีวิว
            </p>

        `;

    }

}


// =====================================================
// LOAD REVIEWS
// =====================================================

// เรียก API และแสดงรายการความคิดเห็น/คะแนนของสถานที่
// อธิบายการทำงาน: ขอรายการรีวิวของสถานที่จาก API แล้วแสดงความคิดเห็น/คะแนนที่ได้รับตามรูปแบบของหน้า
async function loadReviews(
    placeId
) {

    const reviewList =
        document.getElementById(
            "reviewList"
        );


    if (!reviewList) {
        return;
    }


    reviewList.innerHTML = `
        <p>
            กำลังโหลดรีวิว...
        </p>
    `;


    try {

        const response =
            await fetch(
                `/places/${placeId}/reviews`
            );


        if (!response.ok) {

            throw new Error(
                "โหลดรีวิวไม่สำเร็จ"
            );

        }


        const reviews =
            await response.json();


        if (reviews.length === 0) {

            reviewList.innerHTML = `

                <p>
                    ยังไม่มีรีวิวสำหรับสถานที่นี้
                </p>

            `;

            return;
        }


        reviewList.innerHTML = "";


        reviews.forEach(review => {

            const reviewItem =
                document.createElement(
                    "div"
                );


            reviewItem.className =
                "review-item";


            const fullName =
                `${
                    review.USER_FNAME ||
                    ""
                } ${
                    review.USER_LNAME ||
                    ""
                }`.trim();


            const stars =
                "⭐".repeat(
                    Number(
                        review.REVIEW_RATING
                    )
                );


            const date =
                new Date(
                    review.REVIEW_DATE
                ).toLocaleDateString(
                    "th-TH"
                );


            reviewItem.innerHTML = `

                <div class="review-header">

                    <strong>
                        ${
                            fullName ||
                            review.USER_USERNAME
                        }
                    </strong>


                    <span>
                        ${stars}
                    </span>

                </div>


                <p>
                    ${
                        review.REVIEW_COMMENT ||
                        ""
                    }
                </p>


                <small>
                    ${date}
                </small>

            `;


            reviewList.appendChild(
                reviewItem
            );

        });

    } catch (error) {

        console.error(
            "โหลดรีวิวไม่สำเร็จ:",
            error
        );


        reviewList.innerHTML = `

            <p>
                ไม่สามารถโหลดรีวิวได้
            </p>

        `;

    }

}


// =====================================================
// SUBMIT REVIEW
// =====================================================

// ตรวจข้อมูลรีวิวจากแบบฟอร์มและส่งคะแนนกับความคิดเห็นไปยัง API
// อธิบายการทำงาน: อ่านค่าคะแนนและความคิดเห็นจากแบบฟอร์ม ส่งไปยัง API เพื่อให้เซิร์ฟเวอร์ตรวจสอบและบันทึก จากนั้นจัดการข้อความตอบกลับ/รีโหลดส่วนรีวิว
async function submitReview(
    placeId
) {

    const rating =
        document.getElementById(
            "reviewRating"
        ).value;


    const comment =
        document.getElementById(
            "reviewComment"
        ).value;


    if (!rating) {

        alert(
            "กรุณาเลือกคะแนน"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `/places/${placeId}/reviews`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        rating: rating,
                        comment: comment
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.message
            );

            return;
        }


        alert(
            "เพิ่มรีวิวสำเร็จ"
        );


        document.getElementById(
            "reviewRating"
        ).value = "";


        document.getElementById(
            "reviewComment"
        ).value = "";


        document.querySelectorAll(
            ".star"
        ).forEach(star => {

            star.classList.remove(
                "active"
            );

        });


        loadReviews(
            placeId
        );


        loadReviewSummary(
            placeId
        );


    } catch (error) {

        console.error(
            "ส่งรีวิวไม่สำเร็จ:",
            error
        );


        alert(
            "ไม่สามารถส่งรีวิวได้"
        );

    }

}


// =====================================================
// LOAD PLACES
// =====================================================

// โหลดข้อมูลสถานที่เพื่อใช้ในส่วนที่ต้องการรายการสถานที่
// อธิบายการทำงาน: โหลดข้อมูลสถานที่จาก endpoint ของเว็บ เพื่อให้ฟังก์ชันต่าง ๆ นำรายการไปใช้แสดงหรือเติมตัวเลือก
async function loadPlaces() {

    try {

        const response =
            await fetch(
                "/places"
            );


        const places =
            await response.json();


        const container =
            document.getElementById(
                "placeCards"
            );


        if (!container) {
            return;
        }


        container.innerHTML = "";


        places.forEach(place => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card";


            card.innerHTML = `

                <div class="icon">
                    📍
                </div>


                <h3>
                    ${place.PLACE_NAME}
                </h3>


                <p>
                    ${
                        place.PLACE_DESCRIPTION ||
                        ""
                    }
                </p>


                <p>
                    📍
                    ${
                        place.PLACE_ADDRESS ||
                        ""
                    }
                </p>

            `;


            card.onclick =
                function () {

                    showPlaceDetail(
                        place.PLACE_ID
                    );

                };


            container.appendChild(
                card
            );

        });


    } catch (error) {

        console.error(
            "โหลดข้อมูลไม่สำเร็จ:",
            error
        );

    }

}


// =====================================================
// RANDOM PLACE
// =====================================================

let isRandomizing = false;


// สุ่มเลือกสถานที่จากข้อมูลที่โหลดไว้ แล้วแสดงผลให้ผู้ใช้
// อธิบายการทำงาน: จัดการการสุ่ม/اختيارสถานที่ للعرضตามเงื่อนไขในฟังก์ชัน และป้องกันการเรียกซ้ำในช่วงกำลังทำงานตามสถานะที่กำหนด
async function randomPlace() {

    if (isRandomizing) {
        return;
    }


    isRandomizing = true;


    try {

        const response =
            await fetch(
                "/places"
            );


        const places =
            await response.json();


        if (places.length === 0) {

            alert(
                "ยังไม่มีสถานที่ให้สุ่ม"
            );


            isRandomizing =
                false;


            return;
        }


        const resultBox =
            document.getElementById(
                "randomResult"
            );


        if (resultBox) {

            resultBox.style.display =
                "flex";

        }


        const name =
            document.getElementById(
                "randomName"
            );


        const description =
            document.getElementById(
                "randomDescription"
            );


        const address =
            document.getElementById(
                "randomAddress"
            );


        description.innerText = "";

        address.innerText = "";


        let count = 0;


        const rolling =
            setInterval(
                () => {

                    const randomIndex =
                        Math.floor(
                            Math.random() *
                            places.length
                        );


                    name.innerText =
                        places[
                            randomIndex
                        ].PLACE_NAME;


                    name.classList.remove(
                        "rolling-text"
                    );


                    void name.offsetWidth;


                    name.classList.add(
                        "rolling-text"
                    );


                    count++;


                    if (count >= 16) {

                        clearInterval(
                            rolling
                        );


                        const finalIndex =
                            Math.floor(
                                Math.random() *
                                places.length
                            );


                        const place =
                            places[
                                finalIndex
                            ];


                        name.innerText =
                            "🎉 " +
                            place.PLACE_NAME;


                        description.innerText =
                            place.PLACE_DESCRIPTION ||
                            "";


                        address.innerText =
                            "📍 " +
                            (
                                place.PLACE_ADDRESS ||
                                ""
                            );


                        name.onclick =
                            function () {

                                closeRandom();

                                showPlaceDetail(
                                    place.PLACE_ID
                                );

                            };


                        name.style.cursor =
                            "pointer";


                        isRandomizing =
                            false;

                    }

                },
                120
            );


    } catch (error) {

        console.error(
            "สุ่มสถานที่ไม่สำเร็จ:",
            error
        );


        alert(
            "ไม่สามารถโหลดข้อมูลสถานที่ได้"
        );


        isRandomizing =
            false;

    }

}


// =====================================================
// CLOSE RANDOM
// =====================================================

// ปิดหน้าต่างหรือส่วนแสดงผลการสุ่มสถานที่
// อธิบายการทำงาน: ปิดพื้นที่หรือหน้าต่างผลการสุ่มสถานที่ และคืนการแสดงผลตามที่ฟังก์ชันกำหนด
function closeRandom() {

    const resultBox =
        document.getElementById(
            "randomResult"
        );


    if (resultBox) {

        resultBox.style.display =
            "none";

    }

}


// =====================================================
// BACK FROM PLACES
// =====================================================

// ย้อนจากหน้ารายการสถานที่ไปยังหน้าก่อนหน้าตามข้อมูลที่กำหนด
// อธิบายการทำงาน: จัดการการย้อนจากหน้ารายการสถานที่ไปยังหน้าก่อนหน้าตาม flow ของเว็บไซต์
function goBackFromPlaces() {

    history.back();

}


// =====================================================
// BACK FROM DETAIL
// =====================================================

// ย้อนออกจากหน้ารายละเอียดสถานที่
// อธิบายการทำงาน: จัดการการย้อนออกจากหน้ารายละเอียดสถานที่ โดยอิงสถานะการนำทาง/หน้าก่อนหน้าที่ระบบกำหนด
function goBackFromDetail() {

    history.back();

}


// =====================================================
// LOGOUT
// =====================================================

// ส่งคำขอออกจากระบบ แล้วนำผู้ใช้กลับไปยังหน้าที่เหมาะสม
// อธิบายการทำงาน: ส่งคำขอออกจากระบบไปยังเซิร์ฟเวอร์ แล้วปรับหน้าจอ/สถานะผู้ใช้ตามผลที่ตอบกลับ
async function logout() {

    try {

        const response =
            await fetch(
                "/logout"
            );


        const data =
            await response.json();


        if (data.success) {

            history.replaceState(
                {
                    page: "home"
                },
                "",
                "#home"
            );


            location.reload();

        }

    } catch (error) {

        console.error(
            "Logout ไม่สำเร็จ:",
            error
        );

    }

}
// =====================================================
// CHECK LOGIN
// =====================================================

// ตรวจสอบสถานะเข้าสู่ระบบจากเซิร์ฟเวอร์ และปรับเมนูผู้ใช้ตามผลลัพธ์
// อธิบายการทำงาน: ตรวจสถานะ session ของผู้ใช้ผ่าน API แล้วปรับส่วน UI ที่เกี่ยวข้อง เช่น เมนูผู้ใช้หรือปุ่มเข้าสู่ระบบ
async function checkLogin() {
    try {
        // ส่ง HTTP request ไปยัง API และรอผลตอบกลับก่อนทำขั้นตอนถัดไป
    const response = await fetch("/me", {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("ตรวจสอบสถานะ Login ไม่สำเร็จ");
        }

        // แปลงเนื้อหาตอบกลับที่เป็น JSON ให้เป็นค่าที่ JavaScript นำไปใช้งานได้
    const data = await response.json();
        const userMenu = document.getElementById("userMenu");

        if (!userMenu) {
            console.error("ไม่พบ element id='userMenu' ใน HTML");
            return;
        }

        if (data.loggedIn && data.user) {
            userMenu.innerHTML = `
                <span class="username">
                    👤 ${data.user.fname || data.user.username}
                </span>
                <button
                    type="button"
                    class="logout-btn"
                    onclick="logout()"
                >
                    ออกจากระบบ
                </button>
            `;
        } else {
            userMenu.innerHTML = `
                <a href="/login.html" class="login-btn">
                    เข้าสู่ระบบ
                </a>
            `;
        }

    } catch (error) {
        console.error("ตรวจสอบ Login ไม่สำเร็จ:", error);
    }
}
// =====================================================
// BROWSER BACK / FORWARD
// =====================================================

window.addEventListener(
    "popstate",
    function (event) {

        const state =
            event.state;


        // ไม่มี state = Home

        if (!state) {

            showHome(
                true
            );

            return;
        }


        // HOME

        if (
            state.page === "home"
        ) {

            showHome(
                true
            );

            return;
        }


        // TYPES

        if (
            state.page === "types"
        ) {

            showTypes(
                true
            );

            return;
        }


        // MOODS

        if (
            state.page === "moods"
        ) {

            showMoods(
                true
            );

            return;
        }


        // ABOUT

        if (
            state.page === "about"
        ) {

            showAbout(
                true
            );

            return;
        }


        // PLACES จาก TYPE

        if (
            state.page === "places"
        ) {

            showPlaces(
                state.typeId || null,
                true
            );

            return;
        }


        // PLACES จาก MOOD

        if (
            state.page === "moodPlaces"
        ) {

            showMoodPlaces(
                state.moodId,
                true
            );

            return;
        }


        // FAVORITES

        if (
            state.page === "favorites"
        ) {

            showFavorites(
                true
            );

            return;
        }


        // DETAIL

        if (
            state.page === "detail"
        ) {

            showPlaceDetail(
                state.placeId,
                true,
                state.returnPage || null
            );

            return;
        }

        // TRAVEL PLANNER
        if (state.page === "travel") {
            showTravel(true);
            return;
        }

    }
);


// =====================================================
// RESTORE PAGE AFTER REFRESH
// =====================================================

window.addEventListener(
    "DOMContentLoaded",
    function () {

        // ถ้าไม่มี History
        // ให้สร้างหน้า Home

        if (!history.state) {

            history.replaceState(
                {
                    page: "home"
                },
                "",
                "#home"
            );


            showHome(
                true
            );

        } else {

            const state =
                history.state;


            if (
                state.page === "home"
            ) {

                showHome(
                    true
                );


            } else if (
                state.page === "types"
            ) {

                showTypes(
                    true
                );


            } else if (
                state.page === "moods"
            ) {

                showMoods(
                    true
                );


            } else if (
                state.page === "about"
            ) {

                showAbout(
                    true
                );


            } else if (
                state.page === "places"
            ) {

                showPlaces(
                    state.typeId || null,
                    true
                );


            } else if (
                state.page === "moodPlaces"
            ) {

                showMoodPlaces(
                    state.moodId,
                    true
                );


            } else if (
                state.page === "favorites"
            ) {

                showFavorites(
                    true
                );


            } else if (
                state.page === "detail"
            ) {

                showPlaceDetail(
                    state.placeId,
                    true,
                    state.returnPage || null
                );

            } else if (
                state.page === "travel"
            ) {

                showTravel(true);

            } else {

                showHome(
                    true
                );

            }

        }

    }
);


// =====================================================
// GOOGLE MAPS DIRECTIONS
// =====================================================

// เปิดเส้นทาง/ตำแหน่งใน Google Maps
// อธิบายการทำงาน: สร้างหรือเปิดลิงก์ Google Maps ตามข้อมูลจุดหมายในหน้าเว็บ ไม่ได้หมายความว่าเว็บคำนวณเส้นทางเอง
function openGoogleMaps() {
    if (!currentPlace) {
        return;
    }

    const destination = encodeURIComponent(
        currentPlace.PLACE_ADDRESS || currentPlace.PLACE_NAME || ""
    );

    if (!destination) {
        alert("สถานที่นี้ยังไม่มีข้อมูลที่อยู่");
        return;
    }

    const url =
        `https://www.google.com/maps/dir/?api=1` +
        `&origin=${encodeURIComponent("สจล. ลาดกระบัง")}` +
        `&destination=${destination}`;

    window.open(url, "_blank", "noopener");
}


// =====================================================
// TRAVEL PLANNER
// =====================================================

let travelPlacesCache = [];

// แสดงหน้าวางแผนการเดินทางและเตรียมข้อมูลปลายทาง
// อธิบายการทำงาน: เปิดส่วนวางแผนเดินทาง เตรียมรายการสถานที่สำหรับเลือก และอัปเดตข้อมูลประกอบแผน
async function showTravel(fromHistory = false) {
    if (!fromHistory) {
        savePageState("travel");
    }

    const hero = document.querySelector(".hero");
    if (hero) hero.style.display = "none";

    document.querySelectorAll(".content").forEach(section => {
        section.style.display = "none";
    });

    ["typesPage", "moodsPage"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    const randomResult = document.getElementById("randomResult");
    if (randomResult) randomResult.style.display = "none";

    const page = document.getElementById("travelPage");
    if (page) page.style.display = "block";

    const select = document.getElementById("travelDestination");
    const info = document.getElementById("travelInfo");
    if (!select || !info) return;

    if (travelPlacesCache.length) {
        fillTravelDestinations(select, travelPlacesCache);
        updateTravelDetails();
        return;
    }

    select.innerHTML = '<option value="">กำลังโหลดสถานที่...</option>';
    info.innerHTML = "<p>กำลังโหลดข้อมูลสถานที่...</p>";

    try {
        // fetch ขอข้อมูลจาก route ฝั่ง Express และ await รอผลก่อนทำงานต่อ
        // ส่ง HTTP request ไปยัง API และรอผลตอบกลับก่อนทำขั้นตอนถัดไป
    const response = await fetch("/places");
        if (!response.ok) throw new Error("โหลดสถานที่ไม่สำเร็จ");
        const places = await response.json();
        if (!Array.isArray(places)) throw new Error("รูปแบบข้อมูลสถานที่ไม่ถูกต้อง");

        // Remove duplicate place IDs in case a place has multiple image records.
        const unique = new Map();
        places.forEach(place => {
            const key = String(place.PLACE_ID);
            if (!unique.has(key)) unique.set(key, place);
        });
        travelPlacesCache = Array.from(unique.values());

        fillTravelDestinations(select, travelPlacesCache);
        updateTravelDetails();
    } catch (error) {
        console.error("โหลดระบบการเดินทางไม่สำเร็จ:", error);
        select.innerHTML = '<option value="">ไม่สามารถโหลดสถานที่ได้</option>';
        info.innerHTML = "<p>โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</p>";
    }
}

// นำรายการสถานที่มาเติมในตัวเลือกปลายทางของแผนการเดินทาง
// อธิบายการทำงาน: เติมตัวเลือกสถานที่ลงใน select element โดยวนผ่านข้อมูลสถานที่ที่ได้รับ
function fillTravelDestinations(select, places) {
    const previous = select.value;
    select.innerHTML = '<option value="">-- เลือกสถานที่ปลายทาง --</option>';

    places.forEach(place => {
        const option = document.createElement("option");
        option.value = String(place.PLACE_ID);
        option.textContent = place.PLACE_NAME || `สถานที่ ${place.PLACE_ID}`;
        select.appendChild(option);
    });

    if (previous && places.some(place => String(place.PLACE_ID) === previous)) {
        select.value = previous;
    } else if (places.length === 1) {
        select.value = String(places[0].PLACE_ID);
    }
}

// อัปเดตข้อมูลประกอบการเดินทางเมื่อผู้ใช้เปลี่ยนปลายทาง
// อธิบายการทำงาน: อัปเดตรายละเอียดการเดินทางตามตัวเลือกจุดหมายปัจจุบัน
function updateTravelDetails() {
    const select = document.getElementById("travelDestination");
    const info = document.getElementById("travelInfo");
    if (!select || !info) return;

    const place = travelPlacesCache.find(item => String(item.PLACE_ID) === select.value);
    if (!place) {
        info.innerHTML = "<p>เลือกสถานที่ปลายทางเพื่อดูวิธีเดินทางและค่าใช้จ่าย</p>";
        updateTravelMapLink();
        return;
    }

    const safe = value => String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);

    info.innerHTML = `
        <h3>📍 ${safe(place.PLACE_NAME || "สถานที่")}</h3>
        <p><strong>ที่อยู่:</strong> ${safe(place.PLACE_ADDRESS || "ยังไม่มีข้อมูลที่อยู่")}</p>
        <p><strong>ค่าเข้าสถานที่:</strong> ${place.COST_ENTRANCE_FEE == null ? "ไม่มีข้อมูล" : `${safe(place.COST_ENTRANCE_FEE)} บาท`}</p>
        <p><strong>ค่าใช้จ่ายเฉลี่ย:</strong> ${place.COST_AVERAGE == null ? "ไม่มีข้อมูล" : `${safe(place.COST_AVERAGE)} บาท`}</p>
        <p>กดปุ่มแผนที่เพื่อดูเส้นทางไปยังสถานที่นี้</p>
    `;
    updateTravelMapLink();
}

// สร้างหรือปรับลิงก์ Google Maps ตามจุดเริ่มต้น ปลายทาง และรูปแบบเดินทาง
// อธิบายการทำงาน: ปรับ URL/ลิงก์แผนที่ให้สัมพันธ์กับจุดหมายที่ผู้ใช้เลือก
function updateTravelMapLink() {
    const link = document.getElementById("travelMapLink");
    const originEl = document.getElementById("travelOrigin");
    const destinationEl = document.getElementById("travelDestination");
    const modeEl = document.getElementById("travelMode");
    if (!link || !originEl || !destinationEl || !modeEl) return;

    const place = travelPlacesCache.find(item => String(item.PLACE_ID) === destinationEl.value);
    const origin = originEl.value.trim() || "สจล. ลาดกระบัง";
    const destination = place ? (place.PLACE_ADDRESS || place.PLACE_NAME || "") : "";

    if (!origin || !destination) {
        link.href = "https://www.google.com/maps";
        link.setAttribute("aria-disabled", "true");
        link.style.opacity = ".6";
        return;
    }

    const params = new URLSearchParams({
        api: "1",
        origin,
        destination,
        travelmode: modeEl.value
    });
    link.href = `https://www.google.com/maps/dir/?${params.toString()}`;
    link.removeAttribute("aria-disabled");
    link.style.opacity = "1";
}

document.addEventListener("DOMContentLoaded", () => {
    const origin = document.getElementById("travelOrigin");
    if (origin) origin.addEventListener("input", updateTravelMapLink);
});
// =====================================================
// CHECK LOGIN WHEN PAGE LOADS
// =====================================================
window.addEventListener("load", () => {
    checkLogin();
});