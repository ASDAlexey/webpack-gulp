function confirmCtrl($scope, $modalInstance, title, content) {
    $scope.title = title;
    $scope.content = content;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

export default confirmCtrl;
