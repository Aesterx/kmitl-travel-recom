console.log("script.js ทำงานแล้ว");


// =====================================================
// SHOW MESSAGE
// =====================================================

function showMessage(message) {
    alert(
        message || "ยินดีต้อนรับเข้าสู่เว็บไซต์!"
    );
}


// =====================================================
// TOGGLE PASSWORD
// =====================================================

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

function savePageState(page, data = {}) {
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


                    <!-- ================================= -->
                    <!-- การเดินทาง -->
                    <!-- ================================= -->

                    <div
                        class="transport-button"
                        onclick="toggleTransport()"
                    >
                        การเดินทาง
                    </div>


                    <div
                        id="transportDetails"
                        class="transport-details"
                        style="display: none;"
                    >

                        <p>

                            <strong>
                                ประเภท :
                            </strong>

                            ${
                                place.TRANSPORT_TYPE ||
                                "-"
                            }

                        </p>


                        <p>

                            <strong>
                                รายละเอียด :
                            </strong>

                            ${
                                place.TRANSPORT_DESCRIPTION ||
                                "-"
                            }

                        </p>


                        <p>

                            <strong>
                                ค่าเดินทาง :
                            </strong>

                            ${
                                place.TRANSPORT_COST ??
                                "-"
                            }
                            บาท

                        </p>

                    </div>

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

async function showDetailTab(
    tab,
    placeId
) {

    const infoTab =
        document.getElementById(
            "infoTab"
        );

    const reviewTab =
        document.getElementById(
            "reviewTab"
        );

    const buttons =
        document.querySelectorAll(
            ".tab-button"
        );


    if (tab === "info") {

        infoTab.style.display =
            "block";

        reviewTab.style.display =
            "none";


        if (buttons[0]) {

            buttons[0].classList.add(
                "active"
            );

        }


        if (buttons[1]) {

            buttons[1].classList.remove(
                "active"
            );

        }

    } else {

        infoTab.style.display =
            "none";

        reviewTab.style.display =
            "block";


        if (buttons[0]) {

            buttons[0].classList.remove(
                "active"
            );

        }


        if (buttons[1]) {

            buttons[1].classList.add(
                "active"
            );

        }


        loadReviewSummary(
            placeId
        );


        loadReviews(
            placeId
        );

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

function goBackFromPlaces() {

    history.back();

}


// =====================================================
// BACK FROM DETAIL
// =====================================================

function goBackFromDetail() {

    history.back();

}


// =====================================================
// LOGOUT
// =====================================================

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

async function checkLogin() {

    try {

        const response =
            await fetch(
                "/me"
            );


        const data =
            await response.json();


        const userMenu =
            document.getElementById(
                "userMenu"
            );


        if (!userMenu) {
            return;
        }


        if (data.loggedIn) {

            userMenu.innerHTML = `

                <span class="username">

                    👤
                    ${data.user.fname}

                </span>


                <button
                    class="logout-btn"
                    onclick="logout()"
                >
                    ออกจากระบบ
                </button>

            `;

        }

    } catch (error) {

        console.error(
            "ตรวจสอบ Login ไม่สำเร็จ:",
            error
        );

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


            } else {

                showHome(
                    true
                );

            }

        }

    }
);


// =====================================================
// TOGGLE TRANSPORT
// =====================================================

function toggleTransport() {

    const details =
        document.getElementById(
            "transportDetails"
        );


    if (!details) {
        return;
    }


    if (
        details.style.display === "none" ||
        details.style.display === ""
    ) {

        details.style.display =
            "block";

    } else {

        details.style.display =
            "none";

    }

}


// =====================================================
// CHECK LOGIN WHEN PAGE LOADS
// =====================================================

checkLogin();
