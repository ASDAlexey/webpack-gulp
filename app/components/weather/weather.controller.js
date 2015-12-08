class Controller {
    constructor($scope, Weather, $state){
        this.$scope = $scope;
        this.API = Weather;
        this.loadingForecast = true;
        this.header = 'Weather';
        this.days = [];

        var url = $state.href('app.settings.account');
        this.errorMessage = `You have not set your location in your <a href="${url}">account</a>.`;

        this.loadWeatherForecast(this.$scope.user.model, true);
    }

    rebuildWeatherScrollbar(){
        this.$scope.$broadcast('scrollbar:rebuild:weather');
    }

    loadWeatherForecast(user, isShowPreloader = false){
        if (isShowPreloader) this.loadingForecast = true;

        if(user.information.city && angular.isObject(user.information.city)){
            this.API.getDailyWeatherForecast(user.information.city).then((data)=>{

                if(data.cod == 200){

                    var daytime = (new Date()).getHours();

                    if((daytime >= 0) && (daytime < 8)){
                        daytime = 'night';
                    } else if((daytime >= 8) && (daytime < 12)) {
                        daytime = 'morn';
                    } else if((daytime >= 12) && (daytime < 17)) {
                        daytime = 'day';
                    } else {
                        daytime = 'eve';
                    }

                    var currentTemp = Math.round(data.list[0].temp[daytime] - 272.15);
                    this.header = `${data.city.name} ${currentTemp}°C`;

                    var days = [];

                    angular.forEach(data.list, function (value, key) {

                        var day;
                        var wDay = (new Date(value.dt*1000)).getDay();

                        switch(wDay){
                            case 0: day = 'Sun'; break;
                            case 1: day = 'Mon'; break;
                            case 2: day = 'Tue'; break;
                            case 3: day = 'Wed'; break;
                            case 4: day = 'Thu'; break;
                            case 5: day = 'Fri'; break;
                            case 6: day = 'Sat'; break;
                        }

                        if(wDay == (new Date()).getDay()){
                            day = day + ' - TODAY';
                        }

                        this.push({
                            day: day,
                            temp: Math.round(value.temp.min - 272.15) + '°C',
                            tempmax: Math.round(value.temp.max - 272.15)+ '°C',
                            tempmin: Math.round(value.temp.min - 272.15)+ '°C',
                            image: `/assets/images/weather/${value.weather[0].main}.png`
                        });
                    }, days);

                    this.days = days;
                } else {
                    this.errorMessage = 'Weather forecast is not available for your location.';
                }
            }).finally(()=>{
                if (isShowPreloader) this.loadingForecast = false;
            });
        } else {
            if (isShowPreloader) this.loadingForecast = false;
        }
    }
}

export default Controller;
