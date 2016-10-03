(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationController', VacationController);

    VacationController.$inject = ['$scope', '$state', '$filter', 'Vacation', 'ParseLinks', 'AlertService', 'pagingParams', 'paginationConstants'];

    function VacationController ($scope, $state, $filter, Vacation, ParseLinks, AlertService, pagingParams, paginationConstants) {
        var vm = this;

        vm.loadPage = loadPage;
        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.transition = transition;
        vm.itemsPerPage = paginationConstants.itemsPerPage;
        vm.send = send;
        vm.confirm = confirm;

        loadAll();

        function loadAll () {
            Vacation.query({
                page: pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
            function sort() {
                var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
                if (vm.predicate !== 'id') {
                    result.push('id');
                }
                return result;
            }
            function onSuccess(data, headers) {
                vm.links = ParseLinks.parse(headers('link'));
                vm.totalItems = headers('X-Total-Count');
                vm.queryCount = vm.totalItems;
                vm.vacations = data;
                vm.page = pagingParams.page;
            }
            function onError(error) {
                AlertService.error(error.data.message);
            }
        }

        function loadPage (page) {
            vm.page = page;
            vm.transition();
        }

        function transition () {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                search: vm.currentSearch
            });
        }

        function send (vacation) {
            vacation.stage = "SENT";
            Vacation.update(vacation, function (result) {
                loadAll();
                AlertService.info("vacationTrackerApp.vacation.sent", {
                    vacation: {
                        startDate: $filter('date')(new Date(result.startDate), "dd/MM/yyyy"),
                        endDate: $filter('date')(new Date(result.endDate), "dd/MM/yyyy")
                    },
                    manager: { //TODO task #32 & #33
                        firstName: "John",
                        lastName: "Doe"
                    }});
            });
        }

        function confirm (vacation) {
            vacation.stage = "PLANNED";
            Vacation.update(vacation, function (result) {
                loadAll();
                AlertService.info("vacationTrackerApp.vacation.confirmed", {
                    owner: {
                        firstName: result.owner.firstName,
                        lastName: result.owner.lastName
                    }});
            });
        }
    }
})();