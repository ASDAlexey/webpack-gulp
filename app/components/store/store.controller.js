class Store {
    constructor($scope, $uiViewScroll, $timeout, $interval, $state, $location, $anchorScroll, Resource, Category, Product, preloader, Social, User, Auth){
        this.$scope = $scope;
        this.$uiViewScroll = $uiViewScroll;
        this.$timeout = $timeout;
        this.$interval = $interval;
        this.categories = null;
        this.API = Category;
        this.Product = Product;
        this.Social = Social;
        this.User = User;
        this.$state = $state;
        this.stylesOfCategories = [];
        this.stylesOfProducts = [];
        this.$location = $location;
        this.$anchorScroll = $anchorScroll;
        this.Resource = Resource;
        this.Auth = Auth;
        this.defaultTitle = "Store";
        this.currentTitle = '';
        this.titleSelectedCategory = '';
        this.pointsRequired = null;
        this.statusForm = 'ready';

        this.idSelectedCategory = 0;
        this.selectedProduct = null;

        this.angleCategories = 0;
        this.deltaCategories = 0;

        this.deltaProducts = Math.PI * 2 / 18;
        this.angleProducts = 0;
        this.achievement = '';

        preloader.requestIsSent('main');
        this.API.getListOfCategories().then((categories)=>{
            this.categories = _.filter(categories, function(category){ return category.enable });
            this.deltaCategories = Math.PI * 2 / this.categories.length;

            this.checkDomLoaded();
        }).finally(()=>{

            var productId = this.findProductParam();
            if(productId && ($(window).width() >= 768))
                this.showProductForDesctop(productId);

            if(productId && ($(window).width() < 768))
                this.showProductForMobile(productId);

            preloader.responseIsReceived('main');
        });

        this.isLoaded = false;
        this.isContentLoaded = false;
        this.isPreloaderDisplayed = false;


        this.$scope.$on('$viewContentLoaded', ()=>{
            this.isContentLoaded = true;

            this.checkDomLoaded();
        });

        this.$scope.$on('preloader:hide', (data)=>{
            if (data.name === 'main') {
                this.isPreloaderDisplayed = false;

                this.checkDomLoaded();
            };
        });

        this.$scope.$on('preloader:show', (data)=>{
            if (data.name === 'main') {
                this.isPreloaderDisplayed = true;
            };
        });
    }

    findProductParam(){
        var hash = this.$location.hash();

        return hash ? parseInt(hash.replace(/\D/g,''), 10) : null;
    }

    showProductForDesctop(productId){

        var product = this.API.findProductById(productId);
        if(product) this.showDetailProduct(product.category_id, product.id);
    }

    showProductForMobile(){
        this.$anchorScroll();

        var interval = this.$interval(()=>{
            if(this.isLoaded){
                $('img.item-img').on('load', () => {
                    this.$anchorScroll();
                });
                this.$interval.cancel(interval);
            }

        }, 100);
    }

    checkDomLoaded(){
        if (this.isContentLoaded && !this.isPreloaderDisplayed && !!this.categories) {
            this.$timeout(()=>{
                this.isLoaded = true;
            }, 1);
        };
    }

    buyProduct(product){
        if (!this.canIBuy(product)) return;

        this.statusForm = 'sending';

        this.Product.buyProduct(product.id).then((response)=>{
            this.User.setCurrentUser(response.order.user);

            this.statusForm = 'ready';

            this.purchasedProduct = {
                product: product,
                achievement: response.achievement || null
            };

            // scroll to the detail view
            this.$uiViewScroll($(`#product-${product.id}`));
        }, (message)=>{
            this.statusForm = 'ready';
        });
    }

    showDetailProduct(idCategory, idProduct){

        this.$location.hash(`product-${idProduct}`);

        var product = this.API.findProduct(idCategory, idProduct);

        this.selectedProduct = product;
    }

    closeDetailProduct(){
        //in order to remove any hashUrl
        history.pushState('', document.title, window.location.pathname);

        this.purchasedProduct = null;
        this.selectedProduct = null;
    }

    changeTitle(newTitle, points){
        this.currentTitle = newTitle || null;
        this.pointsRequired = points || null;
    }

    selectCategory(idCategory){
        var category = this.API.findCategoryById(idCategory);

        if (this.idSelectedCategory == idCategory) {
            this.titleSelectedCategory = null;
            this.idSelectedCategory = 0;
        } else {
            this.titleSelectedCategory = category.name;
            this.idSelectedCategory = idCategory;
        }
    }

    resetCategory(idCategory, indexCategory){
        var category = this.API.findCategoryById(idCategory);
        var products = _.filter(category.products, function(product){ return product.enable });

        this.deltaProducts = Math.PI * 2 / 18;
        this.angleProducts = -1 * (this.deltaProducts * ((products.length) / 2)) + this.deltaProducts/2  + (indexCategory * this.deltaCategories);
    }

    getStylesOfProduct(idProduct, idCategory, index){
        var category = this.API.findCategoryById(idCategory);
        var product = this.API.findProduct(idCategory, idProduct);

        // native method indexOf works incorrectly
        function getIndexOf(arr, val, prop){
            var l = arr.length,
                k = 0;

            for (k = 0; k < l; k = k + 1) {
                if (arr[k][prop] === val) {
                    return k;
                }
            }

            return false;
        }

        var indexCategory = getIndexOf(this.categories, category.id, 'id');

        if (index == 0) this.resetCategory(idCategory, indexCategory);

        var styles = {
            'background-color': `#${category.colour}`,
            'margin-left': Math.round((330 * Math.cos(this.angleProducts)) - 50) + 'px',
            'margin-top': Math.round((330 * Math.sin(this.angleProducts)) - 50)  + 'px'
        }

        if (product.icon.path) {
            styles['background'] = `url('${this.Resource.getResourceURL(product.icon.path)}') 50% 50% no-repeat #${category.colour}`;
        }

        if (this.idSelectedCategory != idCategory) {
            styles['margin-left'] = this.stylesOfCategories[idCategory]['margin-left'];
            styles['margin-top'] = this.stylesOfCategories[idCategory]['margin-top'];
        }

        this.angleProducts += this.deltaProducts;

        this.stylesOfProducts[idProduct] = styles;

        return styles;
    }

    getStylesOfCategory(idCategory){
        var styles,
            category = this.API.findCategoryById(idCategory);

        styles = {
            'background-color': `#${category.colour}`,
            'margin-left': Math.round((170 * Math.cos(this.angleCategories)) - 50) + 'px',
            'margin-top': Math.round((170 * Math.sin(this.angleCategories)) - 50)  + 'px'
        };

        if (category.icon.path) {
            styles['background'] = `url('${this.Resource.getResourceURL(category.icon.path)}') 50% 50% no-repeat #${category.colour}`;
        }

        this.angleCategories += this.deltaCategories;

        this.stylesOfCategories[idCategory] = styles;

        return styles;
    }

    getNecessaryPoints(product){
        return product.price - this.$scope.user.getJellyPoints();
    }

    canIBuy(product){
        return this.$scope.user.getJellyPoints() >= product.price;
    }

    getUsername(){
        return this.$scope.user.model.information.firstname || this.$scope.user.model.information.nickname || this.$scope.user.model.email;
    }

    shareTweet(achievement){
        this.Social.shareAchievementViaTwitter(
            this.$state.href('app.achievement', {achievementId: achievement.id}, {absolute: true}),
            achievement
        );
    }

    shareFb(achievement){
        this.Social.shareAchievementViaFacebook(this.$state.href('app.achievement', {achievementId: achievement.id}, {absolute: true}), achievement);
    }

    shareEmail(achievement){
        return this.Social.shareAchievementViaEmail(this.$state.href('app.achievement', {achievementId: achievement.id}, {absolute: true}), achievement);
    }
}

export default Store;
