(function() {
    'use strict';

    angular
        .module('vacationTrackerApp')
        .controller('VacationManagementController', VacationManagementController);

    VacationManagementController.$inject = ['$state', '$filter', 'Vacation', 'AlertService', 'pagingParams', 'paginationConstants'];

    function VacationManagementController ($state, $filter, Vacation, AlertService, pagingParams, paginationConstants) {
        var vm = this;

        vm.loadPage = loadPage;
        vm.transition = transition;
        vm.openCalendar = openCalendar;
        vm.filter = filter;

        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.itemsPerPage = paginationConstants.itemsPerPage;

        vm.dateOptions = {
            showWeeks: false,
            startingDay: 1
        };
        vm.datePickerOpenStatus = {
            from: false,
            until: false
        };
        vm.filterParams = {
            owner: null,
            manager: null,
            type: null,
            stage: null,
            from: null,
            until: null
        };

        loadAll();

        function sort() {
            var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
            if (vm.predicate !== 'id') {
                result.push('id');
            }
            return result;
        }

        function onSuccess(data, headers) {
            vm.totalItems = headers('X-Total-Count');
            vm.vacations = data;
            vm.page = pagingParams.page;
        }

        function onError(error) {
            AlertService.error(error.data.message);
        }

        function loadAll () {
            Vacation.query({
                page: pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
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

        function openCalendar(date) {
            vm.datePickerOpenStatus[date] = true;
        }

        function filter() {
            var dateFormat = 'yyyy-MM-dd';
            Vacation.getFilteredVacations({
                type: vm.filterParams.type,
                owner: vm.filterParams.owner === '' ? null : vm.filterParams.owner,
                manager: vm.filterParams.manager === '' ? null : vm.filterParams.manager,
                stage: vm.filterParams.stage,
                from: $filter('date')(vm.filterParams.from, dateFormat),
                until: $filter('date')(vm.filterParams.until, dateFormat),
                page: pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort()
            }, onSuccess, onError);
        }
    }
})();