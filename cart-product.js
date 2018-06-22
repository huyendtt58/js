class FunctionCartProduct {
    setAllProducts = () => {
        localStorage.products = JSON.stringify(products);
    }

    getIndexOfProduct = (id) => {
        return getAllProducts.findIndex(el => el.id == id);
    }

    clearProduct = () => {
        setAllProducts([]);
    }

    removeProduct = (id) => {
        let products = getAllProducts();
        let index = getIndexOfProduct(id);
        products.splice(index, 1);
        setAllProducts(products);
    }

    getAllProducts = () => {
        try {
            let products = JSON.parse(localStorage.products);
            return products;
        } catch (e) {
            return [];
        }
    }

    getTotalPrice = () => {
        let products = getAllProducts();
        let total = 0;
        products.forEach(el => {
            total += el.quantity * el.price;
        });
        total.toFixed(2);
        return total;
    }

    getTotalQuantity = () => {
        let total = 0;
        let products = getAllProducts();
        products.forEach(el => total += el.quantity);
        return total;
    }

    updateProduct = (id, quantity) => {
        let productIndex = getIndexOfProduct(id);
        if (productIndex < 0) {
            return false;
        }
        let products = getAllProducts();
        products[productIndex].quantity = typeof quantity === "undefined" ? products[productIndex].quantity * 1 + 1 : quantity;
        setAllProducts(products);
        return true;
    }

    updateCart() {
        $.each($(".my-product-quantity"), function () {
            var id = $(this).closest("tr").data("id");
            ProductManager.updateProduct(id, $(this).val());
        })
    }

    addToCard = (event) => {
        let id = event.target.data('id');
        let name = event.target.data('name');
        let summary = event.target.data('summary');
        let price = event.target.data('price');
        let quantity = event.target.data('quantity');
        let image = event.target.data('image');
    }
    
    addProduct = (id, name, summary, price, quantity, image) => {
        if (typeof id === "undefined") {
            console.error("id required");
            return false;
        }
        if (typeof name === "undefined") {
            console.error("name required");
            return false;
        }
        if (typeof image === "undefined") {
            console.error("image required");
            return false;
        }
        if (!$.isNumeric(price)) {
            console.error("price is not a number");
            return false;
        }
        if (!$.isNumeric(quantity)) {
            console.error("quantity is not a number");
            return false;
        }
        summary = typeof summary === "undefined" ? "" : summary;
        let products = getAllProducts();
        let product = {
            id: id,
            name: name,
            summary: summary,
            price: price,
            quantity: quantity,
            image: image
        }
        products.push(product);
        setAllProducts(products);
    }

    checkOutCard = () => {
        let phone = $("#phone").val().trim();
        let address = $("#add").val().trim();
        if (phone == "") {
            alert("Phone is required");
            $("#phone").focus();
            return;
        }
        if (address == "") {
            alert("Address is required");
            $("#add").focus();
            return;
        }
        let products = getAllProducts();
        let total = getTotalPrice();
        if (!products.length) {
            $("#" + idEmptyCartMessage).fadeTo('fast', 0.5).fadeTo('fast', 1.0);
            return;
        }
        updateCart();
        // set param in post order
        let orderDetails = [];
        products.forEach(el => {
            let orderDetail = {
                "productId": this.id,
                "quantity": this.quantity,
                "money": this.quantity * this.price
            }
            orderDetails.push(orderDetail);
        })
        let order = {
            "phone": phone,
            "address": address,
            "total": total,
            "listOrderDetail": orderDetails
        }
        // luu order into db
        $.ajax({
            url: "http://localhost:8080/api/order/create-order",
            type: 'POST',
            data: JSON.stringify(order),
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                if (data == "success") {
                    alert("success");
                    ProductManager.clearProduct();
                    $cartBadge.text(ProductManager.getTotalQuantity());
                    $("#" + idCartModal).modal("hide");
                }
            }
        })
    }
}