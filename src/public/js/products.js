console.log("Products frontend javascript file");

$(function () {
    $(".product-collection").on("change", () => {
        const selectedValue = $(".product-collection").val();
        if (selectedValue === "DRINK") {
            $("#product-collection").hide();
            $("#product-volume").show();
        } else {
            $("#product-volume").hide();
            $("#product-collection").show();
        }
    });
    $("#process-btn").on("click", () => {
        $(".dish-container").slideToggle(500);
        $("#process-btn").css("display", "none");
    })

    $("#cancel-btn").on("click", () => {
        $(".dish-container").slideToggle(100);
        $("#process-btn").css("display", "flex");
    })

    $(".new-product-status").on("change", async function (e) {
        const id = e.target.id,
            productStatus = $(`#${id}.new-product-status`).val();

        try {
            const response = await axios.post(`/admin/product/${id}`, { productStatus: productStatus });
            console.log("response:", response);
            const result = response.data;
            if (result.data) {
                console.log("Product updated!");
                $(".new-product-status").blur();
            } else alert("Product update failed!");
        } catch (err) {
            console.log(err);
            alert("Product update failed!");
        }
    });

    $(".product-price-edit").on("change", async function () {
        const id = $(this).data("id");
        const productPrice = Number($(this).val());

        console.log("========== PRICE UPDATE ==========");
        console.log("ID:", id);
        console.log("PRICE:", productPrice);
        console.log("URL:", `/admin/product/${id}`);

        try {
            const response = await axios.post(`/admin/product/${id}`, {
                productPrice: productPrice,
            });

            console.log("response:", response);

            const result = response.data;

            if (result.data) {
                console.log("Product price updated!");
                $(this).blur();
            } else {
                alert("Product price update failed!");
            }
        } catch (err) {
            console.log("ERROR:", err);
            alert("Product price update failed!");
        }
    });
});

function validateForm() {
    const productName = $(".product-name").val(),
        productPrice = $(".product-price").val(),
        productLeftCount = $(".product-left-count").val(),
        productCollection = $(".product-collection").val(),
        productDesc = $(".product-desc").val(),
        productStatus = $(".product-status").val();

    if (
        productName === "" ||
        productPrice === "" ||
        productLeftCount === "" ||
        productCollection === "" ||
        productDesc === "" ||
        productStatus === ""
    ) {
        alert("Please insert all details!");
        return false;
    } else return true;
}

function previewFileHandler(input, order) {
    const imgClassName = input.className;

    const file = $(`.${imgClassName}`).get(0).files[0],
        fileType = file["type"],
        validImageType = ["image/jpg", "image/jpeg", "image/png"];

    if (!validImageType.includes(fileType)) {
        alert("Please insert only jpeg, jpg and png!");
    } else {
        if (file) {
            const reader = new FileReader();
            reader.onload = function () {
                $(`#image-section-${order}`).attr("src", reader.result);
            };
            reader.readAsDataURL(file);
        }
    }
}
