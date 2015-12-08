var directive = function($document, $compile){

    var replyTemplate = `<div class="enter-comment-wrap reply-wrap">
            <div class="avatar">
                <img ng-if="!data.user.avatar" src="/assets/images/default-avatar.png" alt="">
                <img ng-if="data.user.avatar" ng-src="{{ user.Resource.getResourceURL(data.user.avatar) }}" alt="">
            </div>
            <div class="input-wrap">
                <textarea ng-model="message" placeholder="Enter comment..."></textarea>
                <a class="btn _primary" href="" ng-mousedown="achievement.sendComment(message, data.id)">Send</a>
            </div>
        </div>`;
    var reply = null;

    return {
        restrict: 'AE',
        link: function(scope, element, attrs){
            element.on('click', ()=>{

                scope.isOpen = false;

                if(reply){
                    //if elements is equals
                    if($document.find('.post-list').find('.enter-comment-wrap')[0] ===  element.parent().parent().parent().find('.enter-comment-wrap')[0]){
                        $document.find('.post-list').find('.enter-comment-wrap').remove();
                        reply = null;
                        scope.message = null;
                        return;
                    }

                    $document.find('.post-list').find('.enter-comment-wrap').remove();
                }

                reply = $compile(replyTemplate)(scope, function(reply){
                    element.parent().parent().parent().append(reply);
                });
            });

            scope.$on('achievement:comment:send', ()=>{
                $document.find('.post-list').find('.enter-comment-wrap').remove();
                reply = null;
                scope.message = null;
            });
        }
    }
}

export default directive;
