class Controller {
    constructor($modalInstance, $location, couponCode, Coupon, User){
        this.$modalInstance = $modalInstance;
        this.$location = $location;
        this.User = User;
        this.couponCode = couponCode;
        this.model = null;
        this.API = Coupon;
        this.errors = [];
        this.isInvalideCode = false;
    }

    redeem() {
        this.isSending = true;
        this.API.redeemCoupon(this.couponCode).then((coupon)=>{

           //remove code from url
           this.$location.search('');

           this.model = coupon;
        }, (errors)=>{
            this.errors = errors;

            angular.forEach(this.errors, (error, key)=>{
                if (error.message === 'Coupon not found.') {
                    this.isInvalideCode = true;
                }
            });
        }).finally(()=>{
            this.isSending = false;
        });
    }
    
    ok() {

        // update points of user
        if (this.model.data && this.model.data > 0) {
            this.User.addPoints(this.model.data);
        }

        this.$modalInstance.close('close');
    }
}

export default Controller;
