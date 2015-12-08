class Controller{
    constructor($modalInstance, User, Social, Auth){
        this.$modalInstance = $modalInstance;
        this.User = User;
        this.Social = Social;
        this.Auth = Auth;

        this.email = '';
        this.password = '';
        this.rememberMe = true;
        this.nickname = '';

        this.formStatus = 'ready'; // ready || sending
    }

    login(){
        this.formStatus = 'sending';

        this.User.login(this.email, this.password, this.rememberMe).then((user)=>{
            this.formStatus = 'ready';
            this.$modalInstance.close(false); // is new user
        }, ()=>{
            this.formStatus = 'ready';
        });
    }

    signup(){
        this.formStatus = 'sending';

        this.User.signup(this.email, this.password, this.rememberMe).then((user)=>{
            this.formStatus = 'ready';
            this.$modalInstance.close(true); // is new user
        }, ()=>{
            this.formStatus = 'ready';
        });
    }

    recovery(){
        this.formStatus = 'sending';

        this.User.recoveryPasswordByEmail(this.email).then((message)=>{
            this.formStatus = 'ready';
            this.$modalInstance.close(message);
        }, ()=>{
            this.formStatus = 'ready';
        });
    }

    loginViaFacebook(){
        this.Social.loginViaFacebook().then((response)=>{
            this.formStatus = 'ready';
            this.User.setCurrentUser(response.user);
            this.$modalInstance.close(response.isNewUser);
        }, ()=>{
            this.formStatus = 'ready';
        });
    }

    loginViaLinkedIn(){
        this.Social.loginViaLinkedIn().then((response)=>{
            this.formStatus = 'ready';
            this.User.setCurrentUser(response.user);
            this.$modalInstance.close(response.isNewUser);
        }, ()=>{
            this.formStatus = 'ready';
        });
    }
}

export default Controller;
