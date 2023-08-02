import {productDB, cartDB} from '../dao/factory.js';

const addNewCart = async (req, res) => {
    try {
        let newCart = await cartDB.createCart();
        if (!newCart) {
            return res.sendUserError('Error al agregar nuevo carrito.')
        } else {
            return res.sendSuccess(newCart);
        }
    } catch (error) {
        return res.sendServerError('Internal server error.')
    }
}

const getCarts = async (req, res) => {
    try {
        let allCarts = await cartDB.findAllCarts();
        if (!allCarts) {
            return res.sendUserError('Error al buscar carritos.')
        } else {
            let limit = req.query.limit;
            if (limit){
                let LimitedProducts = allCarts.slice(0,limit);
                return res.sendSuccess(LimitedProducts);
            } else {
                return res.sendSuccess(allCarts);  
            }
        }
    } catch (error) {
        return res.sendServerError('Internal server error.')
    }
}

const getCartById = async (req, res) => {
    try {
        let cart = await cartDB.findCartById(req.params.cid)
        if (!cart) {
            return res.sendUserError('Error al buscar el carrito.')
        } else {
            return res.sendSuccess(cart);  
        }
    } catch (error) {
        return res.sendServerError('Internal server error.')
    }
}

const addProductToCart = async (req, res) => {
    try {
        let product = await productDB.findProductById(req.params.pid)
        let cart = await cartDB.findCartById(req.params.cid)
        let cid = req.params.cid;
        if (product && cart) {
            const productIndex = cart.products.findIndex((e) => e.product == (req.params.pid));
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
            let updatedCart = await cartDB.updateOneCart({cid},cart);
            if(!updatedCart){
                return res.sendUserError('Error al agregar el producto.')
            } else{
                return res.sendSuccess(updatedCart);
            }
        } else {
            cart.products.push({ product: (req.params.pid), quantity: 1 });
            let updatedCart = await cartDB.updateOneCart({cid},cart);
            if(!updatedCart){
                return res.sendUserError('Error al agregar el producto.')
            } else{
                return res.sendSuccess(updatedCart);
            }
        }
    } else if (!product){
            return res.sendUserError('Product id not found.');
        } else if (!cart){
            return res.sendUserError('Cart id not found.');
        }
    } catch (error) {
        return res.sendServerError('Internal server error.')
    }
}

const updateCart = async (req, res) => {
    try {
        let cart = await cartDB.findCartById(req.params.cid)
        if (!cart) {
            return res.sendUserError('Id not found.')
        } else {
        let cid = req.params.cid;    
        let product = req.body;
        cart.products = product;
        await cartDB.updateOneCart({cid},cart);
        return res.sendSuccess('Cart updated successfully');
        }
    } catch (error) {
        res.sendServerError('Internal server error.')
    }
}

const updateProductQuantity = async (req, res) => {
    try {
        let newQuantity = parseInt(req.body.quantity);
        let cid = req.params.cid;
        let cart = await cartDB.findCartById(cid)
        if (!cart){
            return res.sendUserError('Cart id not found.');
        } else if (cart) {
            const productIndex = cart.products.findIndex((e) => e.product == (req.params.pid));
            if (productIndex !== -1) {
                cart.products[productIndex].quantity = newQuantity;
                await cartDB.updateOneCart({cid},cart);
                return res.sendSuccess('Quantity updated successfully');
            } else{
                return res.sendUserError('Error al modificar la cantidad.')
            }
        }
    } catch (error) {
        res.sendServerError('Internal server error.')
    }
}

const deleteOneProductFromCart = async (req, res) => {
    try {
        let cid = req.params.cid;
        let cart = await cartDB.findCartById(cid)
        if (!cart){
            return res.sendUserError('Cart id not found.');
        } else if (cart) {
            const productIndex = cart.products.findIndex((e) => e.product == (req.params.pid));
            if (productIndex !== -1) {
                cart.products.splice(productIndex,1);
                await cartDB.updateOneCart({cid},cart);
                return res.sendSuccess('Product deleted successfully');
            }
        }
    } catch (error) {
        res.sendServerError('Internal server error.')
    }
}

const deleteAllProductsFromCart = async (req, res) => {
    try {
        let cid = req.params.cid;
        let cart = await cartDB.findCartById(cid)
        if (!cart){
            return res.status(404).send('Cart id not found.');
        } else if (cart) {
                cart.products.splice(0);
                await cartDB.updateOneCart({cid},cart);
                return res.status(200).send('All products deleted successfully');
            }
    } catch (error) {
        res.sendServerError('Internal server error.')
    }
}
export{
    addNewCart,
    getCarts,
    getCartById,
    addProductToCart,
    updateCart,
    updateProductQuantity,
    deleteOneProductFromCart,
    deleteAllProductsFromCart
}