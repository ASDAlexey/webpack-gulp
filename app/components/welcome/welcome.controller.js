import tourTmpl from './assets/templates/tour.html';
import lastTourTmpl from './assets/templates/last-tour.html';
import thirdTourTmpl from './assets/templates/third-tour.html';

class Controller {
    constructor($scope, $state, $timeout, Welcome, User, Social){
        this.$timeout = $timeout;
        this.$state = $state;
        this.API = Welcome;
        this.User = User;
        this.Social = Social;

        this.steps = [
            {
                title: 'Your Points',
                content: '<strong>Points</strong> make the world go round in JellyChip.<br>The more points you have, the more gifts you can buy.',
                placement: 'top'
            }, {
                title: 'Your Profile',
                content: 'When you buy a gift, it will appear on your <strong>Profile</strong> where others can see your social impact. <strong>Share</strong> your activity with friends on social media and get even more points!',
                placement: 'bottom'
            }, {
                title: 'Earning Points on JellyChip',
                content: 'Start earning points by using <strong>Chat</strong> and answering <strong>Surveys</strong>. Every message you receive and every question you answer gives you points.',
                placement: 'left',
                template: thirdTourTmpl
            }, {
                title: 'Buying a Gift',
                content: 'Explore the JellyChip <strong>Store</strong> and buy gifts that will make a real impact and change lives.',
                placement: 'right'
            }, {
                title: 'Connecting with Friends',
                content: 'Connect with friends on JellyChip and <strong>invite people</strong> to change lives with you!<br><br><strong>Earn 50 points</strong> for every friend you invite who becomes an active user.  ',
                placement: 'left',
                template: lastTourTmpl
            }
        ];
        this.tourTemplate = tourTmpl;
        this.isDomLoading = true;
        this.shouldShowWelcome = false;

        $scope.$on('$viewContentLoaded', ()=>{
            this.$timeout(()=>{
                this.isDomLoading = false;
                this.openModalWindow();
            }, 500);
        });

        this.scrollToCenter();
    }

    openModalWindow(){
        this.shouldShowWelcome = true;
        $('body').addClass('modal-open');
    }

    hideModalWindow(){
        this.shouldShowWelcome = false;
        $('body').removeClass('modal-open');
    }

    scrollToCenter(){
        var $welcome = $('.welcome'),
            welcomeHeight = $welcome.outerHeight(),
            welcomeWidth = $welcome.outerWidth(),
            $window = $(window),
            windowHeight = $window.outerHeight(),
            windowWidth = $window.outerWidth();

        $('body, html').stop(true, true).animate({
            scrollTop: Math.ceil(welcomeHeight / 2 - windowHeight / 2),
            scrollLeft: Math.ceil(welcomeWidth / 2 - windowWidth / 2)
        }, 100);
    }

    handlerEndTour(tour){
        this.Social.openModalInviteFriends(0).finally(()=>{
            this.API.endWelcomeTour().then((data)=>{
                this.User.setCurrentUser(data);
                this.$state.go('app.home');
            });
        });
    }

    handlerStartTour(tour){
        tour._options.autoscroll = false;
        tour._options.delay = 600;

        this.handlerScrollTour(tour, 0);
    }

    handlerShownTour(tour){
        var $element = $('.popover.tour-tour'),
            $tip = $element.data('bs.popover') ? $element.data('bs.popover').tip() : $element.data('popover').tip();

        this.repositionTour(tour, $tip, tour.getCurrentStep());
    }

    repositionTour(tour, $tip, step){
        var $element = $(tour._options.steps[step].element[0]),
            placement = tour._options.steps[step].placement,
            tipOffset = {
                left: 0,
                top: 0
            },
            tipHeight = $tip.outerHeight(),
            tipWidth = $tip.outerWidth(),
            $offsetParent = $element.offsetParent(),
            offsetParentWidth = $offsetParent.outerWidth(),
            offsetParentHeight = $offsetParent.outerHeight(),
            heightArrow = 30,
            elementOffset = $element.offset(),
            elementHeight = $element.outerHeight(),
            elementWidth = $element.outerWidth();

        switch (placement) {
            case 'top':
                tipOffset.left = elementOffset.left + elementWidth / 2 - tipWidth / 2;
                tipOffset.top = elementOffset.top - tipHeight - heightArrow;
                break;
            case 'bottom':
                tipOffset.left = elementOffset.left + elementWidth / 2 - tipWidth / 2;
                tipOffset.top = elementOffset.top + elementHeight + heightArrow;
                break;
            case 'left':
                tipOffset.left = elementOffset.left - heightArrow - tipWidth;
                tipOffset.top = elementOffset.top + elementHeight / 2 - tipHeight / 2;
                break;
            case 'right':
                tipOffset.left = elementOffset.left + elementWidth + heightArrow;
                tipOffset.top = elementOffset.top + elementHeight / 2 - tipHeight / 2;
                break;
        }

        tipOffset.left = Math.max(0, tipOffset.left);
        tipOffset.top = Math.max(0, tipOffset.top);

        if (offsetParentWidth < tipOffset.left + tipWidth) {
            tipOffset.left = offsetParentWidth - tipWidth;
        }
        if (offsetParentHeight < tipOffset.top + tipHeight) {
            tipOffset.top = offsetParentHeight - tipHeight;
        }

        $tip.offset({
            left: Math.ceil(tipOffset.left),
            top: Math.ceil(tipOffset.top)
        });

        this.repositionArrowTour($tip, placement, $element, tipOffset, elementOffset);
    }

    repositionArrowTour($tip, placement, $element, tipOffset, elementOffset) {
        var $arrow = $tip.find('.arrow'),
            arrowHeight = $arrow.outerHeight(),
            arrowWidth = $arrow.outerWidth(),
            elementHeight = $element.outerHeight(),
            elementWidth = $element.outerWidth(),
            tipHeight = $tip.outerHeight(),
            tipWidth = $tip.outerWidth(),
            offsetPosition = 20,
            position = {
                left: '50%',
                top: '50%'
            };

        if (placement === 'top' || placement === 'bottom') {
            var targetLeft = elementOffset.left + elementWidth / 2,
                minValue = tipOffset.left + offsetPosition,
                maxValue = tipOffset.left + tipWidth - arrowWidth / 2 - offsetPosition;

            if (targetLeft < minValue) {
                position.left = minValue - tipOffset.left;
            } else if (targetLeft > maxValue) {
                position.left = maxValue - tipOffset.left;
            } else {
                position.left = targetLeft - tipOffset.left;
            }
        } else {
            var targetTop = elementOffset.top + elementWidth / 2,
                minValue = tipOffset.top + offsetPosition,
                maxValue = tipOffset.top + tipHeight - arrowHeight / 2 - offsetPosition;

            if (targetTop < minValue) {
                position.top = minValue - tipOffset.top;
            } else if (targetTop > maxValue) {
                position.top = maxValue - tipOffset.top;
            } else {
                position.top = targetTop - tipOffset.top;
            }
        }

        switch (placement) {
            case 'top':
                $arrow.css({
                    left: Math.ceil(position.left)
                });
                break;
            case 'bottom':
                $arrow.css({
                    left: Math.ceil(position.left)
                });
                break;
            case 'left':
                $arrow.css({
                    top: Math.ceil(position.top)
                });
                break;
            case 'right':
                $arrow.css({
                    top: Math.ceil(position.top)
                });
                break;
        }
    }

    handlerNextTour(tour){
        var step = tour._current + 1;

        this.handlerScrollTour(tour, step);
    }

    handlerPrevTour(tour){
        var step = tour._current - 1 || 0;

        this.handlerScrollTour(tour, step);
    }

    handlerScrollTour(tour, step){
        var $element = $(tour._options.steps[step].element[0]),
            placement = tour._options.steps[step].placement,
            offsetTop = $element.offset().top,
            offsetLeft = $element.offset().left,
            indents = {
                left: 0,
                top: 0
            },
            scrollTop = 0,
            scrollLeft = 0;

        switch (placement) {
            case 'top':
                indents.left = 150;
                indents.top = $element.outerHeight() + 250;
                scrollTop = Math.max(0, offsetTop - indents.top),
                scrollLeft = Math.max(0, offsetLeft - indents.left);
                break;
            case 'bottom':
                indents.left = $element.outerWidth() + 200;
                indents.top = 60;
                scrollTop = Math.max(0, offsetTop - indents.top),
                scrollLeft = Math.max(0, offsetLeft - indents.left);
                break;
            case 'left':
                indents.left = $element.outerWidth() + 300;
                indents.top = $element.outerHeight() / 2 + 110;
                scrollTop = Math.max(0, offsetTop - indents.top),
                scrollLeft = Math.max(0, offsetLeft - indents.left);
                break;
            case 'right':
                indents.left = $element.outerWidth() + 300;
                indents.top = $element.outerHeight() / 2 + 110;
                scrollTop = Math.max(0, offsetTop - indents.top),
                scrollLeft = Math.max(0, offsetLeft + indents.left);
                break;
        }

        $('body, html').stop(true, true).animate({
            scrollTop: Math.ceil(scrollTop),
            scrollLeft: Math.ceil(scrollLeft)
        }, 500);
    }
}

export default Controller;
