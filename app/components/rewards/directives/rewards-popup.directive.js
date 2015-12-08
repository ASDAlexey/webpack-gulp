import rewardsTemplate from '../rewards-modal.tmpl.html';
class DirectiveCtrl {
    constructor($scope, $timeout) {
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.titleStart = this.$scope.titleStart;
        this.titleStop = this.$scope.titleStop;
        this.notificationNumber = this.$scope.notificationNumber;

        this.isOpen = false;
        this.props = {};
        this.rewardsData = {
            day: null
        };
        this.getDiapazon(this.rewardsData.day);
        this.$scope.$watch('notificationNumber', (newValue, oldValue)=> {
            if (!angular.equals(newValue, oldValue) && newValue) {
                this.notificationNumber = newValue;
                this.getData();
            }
        });
        this.$scope.$watch('rewardsData.day', (newValue, oldValue)=> {
            if (!angular.equals(newValue, oldValue)) {
                this.getDiapazon(newValue);
                if (newValue == 30) {
                    this.goToBonusStep(newValue);
                }
            }
        });

    }

    getData() {
        this.rewardsData.day = this.notificationNumber;
        this.$scope.rewardsData = this.rewardsData;
        if (!this.isOpen) {
            this.$timeout(()=> {
                this.open();
            }, 2000);
        }
    }

    goToBonusStep(day) {
        var that = this;
        this.$timeout(function () {
            that.rewardsData.day = '31';
        }, 3500);
    }

    getDiapazon(day = 0) {
        day = this.rewardsData.day;
        if (day >= 0 && day <= 3)
            this.props.diapazon = 0;
        else if (day >= 4 && day <= 7)
            this.props.diapazon = 1;
        else if (day >= 8 && day <= 30)
            this.props.diapazon = 2;
        else if (day == 31)
            this.props.diapazon = 3;
    }

    calcNumberDayInDiapazon(currentDay, diapazon) {
        let numberDayInDiapazon = 0;
        let lenghtDiapazon = 0;
        if (diapazon == 0) {
            numberDayInDiapazon = currentDay;
            lenghtDiapazon = 3;
        } else if (diapazon == 1) {
            numberDayInDiapazon = currentDay % 4 + 1;
            lenghtDiapazon = 4;
        } else if (diapazon == 2) {
            numberDayInDiapazon = currentDay - 7;
            lenghtDiapazon = 23;
        }
        return {
            numberDayInDiapazon: numberDayInDiapazon,
            lenghtDiapazon: lenghtDiapazon
        }
    }

    getPercent(currentDay, diapazon) {
        let dataDiapazon = this.calcNumberDayInDiapazon(currentDay, diapazon);
        if (currentDay >= 1 && currentDay < 7)
            return dataDiapazon.numberDayInDiapazon / dataDiapazon.lenghtDiapazon * 100;
        else if (currentDay > 7 && currentDay < 15)
            return dataDiapazon.numberDayInDiapazon / 7 * 50;
        else if (currentDay >= 15 && currentDay < 31)
            return 50 + (dataDiapazon.numberDayInDiapazon - 7 ) / 16 * 50;
    }

    getRange(str) {
        let range = {};
        if (this.props.diapazon == 0) {
            range.start = 0;
            range.end = 4;
        } else if (this.props.diapazon == 1) {
            range.start = 3;
            range.end = 8;
        } else if (this.props.diapazon == 2) {
            range.start = 7;
            range.end = 31;
        } else if (this.props.diapazon == 3) {
            range.start = 31;
            range.end = 31;
        }
        if (str == 'start')
            return range.start;
        else if (str = 'end')
            return range.end;
    }

    getPoints(day) {
        if (day < 31)
            return day * 10;
        else if (day == 31)
            return 1000;
    }

    getTitle(day) {
        if (day == 31) {
            return this.titleStop;
        }
        else if (day < 31) {
            return this.titleStart;
        }
    }

    open() {
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
    }

}
class Directive {
    constructor() {
        //Directive settings
        this.restrict = 'E';
        this.replace = true;
        this.template = rewardsTemplate;
        this.controller = DirectiveCtrl;
        this.controllerAs = 'rewards';
        this.scope = {
            titleStart: "@",
            titleStop: "@",
            notificationNumber: "="
        };
        this.link = (scope, element, attrs, ctrls, transludeFn)=> {
            scope._ = _;
        };

    }


    static factory() {
        var directive = () =>
            new Directive();
        return directive;
    }
}

export default Directive;