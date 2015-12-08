class Controller{
    constructor($scope, $modalInstance, $q, survey, Payments, User, COST_OF_RESPONSE, stripe, logger){
        this.$scope = $scope;
        this.$modalInstance = $modalInstance;
        this.$q = $q;
        this.API = Payments;
        this.User = User;
        this.stripe = stripe;
        this.logger = logger;
        this.survey = survey;
        this.costOfResponse = COST_OF_RESPONSE;

        this.isLoading = false;
        this.points = 0;
        this.responses = 0;

        if (this.User.getCurrentUser()) {
            var wallet = _.findWhere(this.User.getCurrentUser().wallets, { type: 'SURVEY' });

            if (wallet) this.points = wallet.value;
            this.responses = this.getResponses();
        }

        this.card = {
            number: '',
            cvc: '',
            exp_month: '',
            exp_year: '',
            name: ''
        };
        this.isValidMonth=true;
        this.isValidYear=true;
    }

    getResponses(){
        return angular.isDefined(this.survey.cost) && this.points < this.survey.cost ? this.survey.cost - this.points : 0;
    }

    fixCountResponses(min = 0){
        this.responses = Math.max(this.responses, min);
    }

    getTypeOfCard(){
        return this.card.number ? this.stripe.card.cardType(this.card.number) : 'Unknown';
    }

    isValidCard(){
        return this.API.isValidCard(this.card);
    }
    isValidExpiry(){
        return this.API.isValidExpiry(this.card);
    }

    getAvailableYears(){
        var year = new Date().getFullYear(),
            years = [];

        for (let i = 0; i < 12; i++) {
            years.push(year + i);
        }

        return years;
    }

    pay(){
        if (this.isValidCard()) {
            this.isLoading = true;
            this.stripe.card.createToken(this.card)
                .then((token)=>{
                    return this.API.charge(token.id, this.responses, this.survey.id || '')
                        .then((response)=>{
                            this.logger.success('Your payment was successful.');

                            return this.User.getUser();
                        }, (response)=>{
                            this.logger.error('Your payment was unsuccessful.');

                            return this.$q.reject(response);
                        })
                        .then((user)=>{
                            this.$modalInstance.close('close');
                        }, ()=>{
                            return this.$q.reject();
                        });
                }, (error)=>{
                    if (error.message) {
                        this.logger.error(error.message);
                    }

                    return this.$q.reject(error);
                })
                .catch(()=>{
                    this.isLoading = false;
                });
        }
    }
}

export default Controller;
