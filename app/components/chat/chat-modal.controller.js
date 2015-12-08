class Controller{
    constructor($modalInstance){
        this.$modalInstance = $modalInstance;
    }

    cancel(){
        this.$modalInstance.dismiss('cancel');
    }

    mute(){
        this.$modalInstance.close('mute');
    }

    unmute(){
        this.$modalInstance.close('unmute');
    }
}

export default Controller;