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
        $("#process-btn").hide();
    });

    $("#cancel-btn").on("click", () => {
        $(".dish-container").slideToggle(100);
        $("#process-btn").css("display", "flex");
    });

    $(".new-product-status").on("change", async function (event) {
        const id = event.target.id;
        const productStatus = $(this).val();

        try {
            const response = await axios.post(`/admin/product/${id}`, { productStatus });
            if (response.data.data) {
                $(this).blur();
            } else {
                alert("Product update failed!");
            }
        } catch (err) {
            console.log(err);
            alert("Product update failed!");
        }
    });

    $(".edit-product-btn").on("click", function () {
        const row = $(this).closest(".product-row");

        $(".product-row.is-editing").not(row).each(function () {
            cancelRowEdit($(this));
        });

        enterRowEdit(row);
    });

    $(".cancel-edit-btn").on("click", function () {
        cancelRowEdit($(this).closest(".product-row"));
    });

    $(".save-product-btn").on("click", async function () {
        const button = $(this);
        const row = button.closest(".product-row");
        const productName = String(row.find(".product-name-input").val()).trim();
        const productPriceValue = String(row.find(".product-price-input").val()).trim();
        const productCountValue = String(row.find(".product-count-input").val()).trim();
        const productPrice = Number(productPriceValue);
        const productLeftCount = Number(productCountValue);

        const validationMessage = validateProductEdit(
            productName,
            productPriceValue,
            productPrice,
            productCountValue,
            productLeftCount
        );

        if (validationMessage) {
            alert(validationMessage);
            return;
        }

        button.prop("disabled", true);

        try {
            const id = row.data("product-id");
            const response = await axios.post(`/admin/product/${id}`, {
                productName,
                productPrice,
                productLeftCount,
            });

            if (!response.data.data) {
                alert("Product update failed!");
                return;
            }

            finishRowEdit(row, {
                productName,
                productPrice,
                productLeftCount,
            });
        } catch (err) {
            console.log(err);
            alert("Product update failed!");
        } finally {
            button.prop("disabled", false);
        }
    });
});

function enterRowEdit(row) {
    if (row.hasClass("is-editing")) return;

    const original = {
        productName: row.find(".product-name-cell .cell-value").text().trim(),
        productPrice: row.find(".product-price-cell .cell-value").text().replace("$", "").trim(),
        productLeftCount: row.find(".product-count-cell .cell-value").text().trim(),
    };

    row.data("original-values", original);
    row.addClass("is-editing");

    replaceCellWithInput(row.find(".product-name-cell"), "text", "product-name-input", original.productName);
    replaceCellWithInput(row.find(".product-price-cell"), "number", "product-price-input", original.productPrice, "0.01");
    replaceCellWithInput(row.find(".product-count-cell"), "number", "product-count-input", original.productLeftCount, "1");

    row.find(".edit-product-btn").prop("hidden", true);
    row.find(".edit-actions").prop("hidden", false);
    row.find(".product-name-input").trigger("focus");
}

function replaceCellWithInput(cell, type, className, value, step) {
    const input = $("<input>", {
        type,
        class: `inline-edit-input ${className}`,
        value,
        min: type === "number" ? 0 : undefined,
        step: step || undefined,
        "aria-label": className.replace(/-/g, " "),
    });

    cell.empty().append(input);
}

function validateProductEdit(name, priceText, price, countText, count) {
    if (!name) return "Product name cannot be empty.";
    if (priceText === "" || !Number.isFinite(price) || price < 0) {
        return "Product price must be a valid non-negative number.";
    }
    if (countText === "" || !Number.isInteger(count) || count < 0) {
        return "Product left count must be a non-negative whole number.";
    }
    return "";
}

function cancelRowEdit(row) {
    const original = row.data("original-values");
    if (!original) return;

    finishRowEdit(row, {
        productName: original.productName,
        productPrice: Number(original.productPrice),
        productLeftCount: Number(original.productLeftCount),
    });
}

function finishRowEdit(row, values) {
    row.find(".product-name-cell").empty().append($("<span>", { class: "cell-value", text: values.productName }));
    row.find(".product-price-cell").empty().append($("<span>", { class: "cell-value", text: `$${values.productPrice}` }));
    row.find(".product-count-cell").empty().append($("<span>", { class: "cell-value", text: values.productLeftCount }));

    row.removeClass("is-editing").removeData("original-values");
    row.find(".edit-product-btn").prop("hidden", false);
    row.find(".edit-actions").prop("hidden", true);
}

function validateForm() {
    const productName = $(".product-name").val();
    const productPrice = $(".product-price").val();
    const productLeftCount = $(".product-left-count").val();
    const productCollection = $(".product-collection").val();
    const productDesc = $(".product-desc").val();
    const productStatus = $(".product-status").val();

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
    }
    return true;
}

function previewFileHandler(input, order) {
    const imgClassName = input.className;
    const file = $(`.${imgClassName}`).get(0).files[0];
    if (!file) return;

    const validImageType = ["image/jpg", "image/jpeg", "image/png"];
    if (!validImageType.includes(file.type)) {
        alert("Please insert only jpeg, jpg and png!");
        input.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = function () {
        $(`#image-section-${order}`).attr("src", reader.result);
    };
    reader.readAsDataURL(file);
}
