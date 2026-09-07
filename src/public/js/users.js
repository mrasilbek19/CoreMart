console.log("Users frontend javascript file");

$(function () {
    const modal = document.querySelector(".user-detail-modal");

    if (modal) {
        const profileImage = modal.querySelector(".user-detail-image");
        const missingImage = modal.querySelector(".user-detail-image-missing");

        profileImage.addEventListener("error", function () {
            missingImage.hidden = false;
            if (profileImage.getAttribute("src") !== "/img/default.webp") {
                profileImage.src = "/img/default.webp";
                profileImage.alt = "Default avatar";
            } else {
                profileImage.hidden = true;
            }
        });

        document.querySelectorAll(".user-name").forEach(function (button) {
            button.addEventListener("click", function () {
                const user = JSON.parse(button.dataset.user);
                modal.querySelectorAll("[data-field]").forEach(function (field) {
                    const value = user[field.dataset.field];
                    field.textContent = value == null || String(value).trim() === ""
                        ? "Not provided" : value;
                });

                profileImage.hidden = false;
                profileImage.alt = "Default avatar";
                profileImage.src = "/img/default.webp";
                missingImage.hidden = false;
                if (user.memberImage && user.memberImage.trim()) {
                    // Uploaded images are stored as relative paths, e.g. uploads/members/....
                    profileImage.src = "/" + user.memberImage.replace(/^\.?\/+/, "");
                    profileImage.alt = "User profile";
                    missingImage.hidden = true;
                }
                modal.showModal();
                modal.querySelector(".user-detail-content").scrollTop = 0;
            });
        });

        modal.querySelector(".user-detail-close").addEventListener("click", function () {
            modal.close();
        });
        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                modal.close();
            }
        });
    }

    $(".member-status").on("change", function (e) {
        const id = e.target.id;

        const memberStatus = $(`#${id}.member-status`).val();
        console.log("memberStatus:", memberStatus);

        axios
            .post("/admin/user/edit", {
                _id: id,
                memberStatus: memberStatus,
            })
            .then((response) => {
                console.log("response:", response);
                const result = response.data;

                if (result.data) {
                    console.log("User updated!");
                    const button = e.target.closest("tr").querySelector(".user-name");
                    const user = JSON.parse(button.dataset.user);
                    user.memberStatus = result.data.memberStatus;
                    button.dataset.user = JSON.stringify(user);
                    $(".member-status").blur();
                } else alert("User update failed!");
            })
            .catch((err) => {
                console.log(err);
                alert("User update failed!");
            });
    });
});
