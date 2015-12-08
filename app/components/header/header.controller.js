class Header {
    constructor($scope, Auth, modalCoupon, Social){
        this.Auth = Auth;
        this.modalCoupon = modalCoupon;
        this.Social = Social;
        this.menuIsOpened = false;

        $scope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams)=>{
            this.menuIsOpened = false;
        });
    }

    toggleMenu(){
        this.menuIsOpened = !this.menuIsOpened;
    }

    closeMenu(){
        this.menuIsOpened = false;
    }
}

export default Header;
