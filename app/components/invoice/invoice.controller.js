class Controller{
    constructor($scope, $state, Invoice, User, Modal){
        this.API = Invoice;
        this.invoice = null;
        this.invoices = null;
        this.UserFactory = User;
        if(!User.getCurrentUser()){
            $scope.$watch((scope)=>{
                return scope.user.model;
            }, (newValue, oldValue) => {
                this.user = newValue;
                if(this.user)
                    this.user.username = User.getUsername(this.user);
            });
        } else {
            this.user = User.getCurrentUser();
            if(this.user)
                this.user.username = User.getUsername(this.user);
        }

        var modalOptions = {
            backdrop: true,
            keyboard: true,
            windowClass: 'invoice-modal'
        };

        this.invoiceModal = new Modal('app.invoice.list', 'app.invoice.invoice', modalOptions);

        if ($state.params.invoiceId){
            this.API.getMyInvoiceById($state.params.invoiceId).then((invoice)=>{
                this.invoice = invoice;
            });
        } else {
            this.API.getMyInvoices().then((invoices) => {
                this.invoices = invoices;
            });
        }

        $scope.$on('$destroy', ()=>{
             this.invoiceModal.destroyModal();
        });
    }
}

export default Controller;
