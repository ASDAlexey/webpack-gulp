class Controller {

    constructor($state, $window, $scope, $filter, Resource, Achievement, Social, Auth, Friend, logger, User){
        this.API = Achievement;
        this.Resource = Resource;
        this.Auth = Auth;
        this.User = User;
        this.Friend = Friend;
        this.logger = logger;
        this.model = null;
        this.Social = Social;
        this.$window = $window;
        this.$filter = $filter;
        this.$state = $state;
        this.$scope = $scope;
        this.comments = [];
        this.commented = false;
        this.liked = false;
        // max depth of comments render
        this.maxDepth = 3;
        // cache friends statuses
        this.friends = [];

        if ($state.params.achievementId){
            this.API.getAchievementsById($state.params.achievementId).then((data)=>{
                this.model = data.response;
                this.commented = data.meta.commented;
                this.liked = data.meta.liked;

                $scope.$emit('achievement:load', this.model);
            });

            this.API.getAchievementComments($state.params.achievementId).then((data)=>{
                this.comments = data.list;
                this.differTime = data.timeDifference;
            });

            $scope.$on('achievement:comment:send', ()=>{
                this.model.comments += 1;
                this.commented = true;
            });

            $scope.$on('jellyLikeAchievement', (event, data)=>{
                this.model.likes = data.response.likes;
                this.liked = data.meta.liked;
            });
        }
    }

    shareTweet(){
        this.Social.shareAchievementViaTwitter(this.$window.location.href, this.model);
    }

    shareFb(){
        this.Social.shareAchievementViaFacebook(this.$window.location.href, this.model);
    }

    shareEmail(){
        if(this.model)
            return this.Social.shareAchievementViaEmail(this.$window.location.href, this.model);
    }

    like(){
        this.API.like(this.model.id);
    }

    getUrlToProduct(){
        var url = this.$state.href('app.store');

        if (this.model && this.model.product) url += `#product-${this.model.product.id}`;

        return url;
    }

    getRelativeDate(timestamp){
        return this.$filter('relativeDate')(new Date((parseInt(timestamp, 10) * 1000) - this.differTime));
    }

    getCommentsDependsOnMaxDepth(comment, maxDepth = this.maxDepth){
        var comments = [];

        function getInlineList(data){
            _.forEach(data, function (value, key){
                comments.push(value);

                if(value.comments.length > 0) {
                    getInlineList(value.comments);
                    value.comments = [];
                }
            });
        }

        if(comment.level >= maxDepth - 1){
            getInlineList(comment.comments);

            return comments;
        } else {
            return comment.comments;
        }
    }

    addComment(comment, data, maxDepth = this.maxDepth){

        if(!comment.reply){
            data.unshift(comment);
            return;
        } else {
            if(comment.level > maxDepth){
                var levels = comment.path.split(',');
                comment.reply = parseInt(levels[maxDepth - 2]);
                comment.level = maxDepth;
            }
        }

        angular.forEach(data, (value, key)=>{
            if(value.comments.length > 0) this.addComment(comment, value.comments);
            if(comment.reply == value.id){
                value.comments.push(comment);
                return;
            }
        });
    }

    sendComment(message, reply = null){

        var comment = {};
        comment.achievement = this.model.id;
        if(message) comment.message = message;
        if(reply) comment.comment = reply;

        this.API.sendComment(comment).then((comment)=>{
            this.addComment(comment, this.comments);

            this.$scope.message = null;
        });
    }

    isFriend(userId){

        var friend = _.find(this.friends, (obj) => { return obj.id == userId; });

        if(!friend){

            this.friends.push({id: userId, status: false});

            this.Friend.isFriend(userId).then((data)=>{

                var status = false;
                status = (data.friend || data.out) ? false : true;

                var friend = _.find(this.friends, (obj) => { return obj.id == userId; });
                friend.status = status;

                return status;
            });

        } else {
            return friend.status;
        }
    }

    addFriend(user, $event){

        this.Friend.addFriendByUser(user.id).then(()=>{
            var username = this.User.getUsername(user);
            this.logger.success(`Friend request was sent to ${username}`);
            $($event.target).hide();
        });
    }
}

export default Controller;
