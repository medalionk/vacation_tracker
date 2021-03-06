'use strict';

describe('E2e tests', function () {

    var h = require('./helperFunctions.js');

    it('should filter users by user User', function() {
        h.login('admin','admin');
        element(by.id('admin-menu')).click().then(function () {
            element.all(by.css('[ui-sref="user-management"]')).first().click().then(function () {
                h.loginFilter.sendKeys('user').then(function() {
                    h.filter.click().then(function() {
                        expect(element.all(by.xpath('//table/tbody/tr')).count()).toEqual(1);
                        element(by.buttonText('Edit')).click().then(function() {
                            element(by.css('[name="firstWorkday"]')).clear().then(function() {
                                element(by.css('[name="firstWorkday"]')).sendKeys('31/12/2015');
                            });
                            element(by.css('[name="unusedVacationDays"]')).clear().then(function() {
                                element(by.css('[name="unusedVacationDays"]')).sendKeys(0);
                            });
                            h.submit.click();
                        });
                    });
                });
            });
        });
    });

    it('should log out with admin user', function() {
        h.logout.click();
    });

    it ('should log in with user User', function() {
        h.login('user','user');

    });

    /*
    it('should log in with user user and clean up the environment', function () {
        h.login('user','user');
        element.all(by.css('[ui-sref="vacation"]')).first().click().then(function() {
            console.log(element.all(by.buttonText('Cancel request')).count());
            if(element.all(by.buttonText('Cancel request')).count() > 0) {
                element.all(by.buttonText('Cancel request')).then(function (cancels) {
                    cancels.click();
                    element(by.id(submitId)).submit();
                });
            }
            if(element.all(by.buttonText('Delete')).count() > 0) {
                element.all(by.buttonText('Delete')).then(function (deletes) {
                    deletes.click();
                    element(by.id(submitId)).submit();
                });
            }
        });
    });*/

    it('should load Vacations', function () {
        h.checkTitle('[ui-sref="vacation"]', 'h2', /vacationTrackerApp.vacation.home.title/);
    });

    it('should create a vacation', function () {
        h.addNew.click().then(function () {
            h.startDate.sendKeys(h.dateString);
            h.endDate.sendKeys(h.endDateString);
            h.submit.click();
            });
        h.checkRequestData(h.vacationTypeColumn,/vacationTrackerApp.VacationType.PAID/);
        h.checkRequestData(h.vacationStageColumn,/vacationTrackerApp.Stage.SAVED/);
        h.checkRequestData(h.vacationPaymentColumn,/vacationTrackerApp.PaymentType.BEFORE_VACATION/);
        });


    it('should send a vacation', function () {
        h.clickButton(h.vacationButtonColumn,'Send to confirmation');
        h.checkRequestData(h.vacationTypeColumn,/vacationTrackerApp.VacationType.PAID/);
        h.checkRequestData(h.vacationStageColumn,/vacationTrackerApp.Stage.SENT/);
        h.checkRequestData(h.vacationPaymentColumn,/vacationTrackerApp.PaymentType.BEFORE_VACATION/);
        expect(h.vacationButtonColumn.element(by.buttonText('Cancel request')).isPresent()).toBe(true);
        expect(h.vacationButtonColumn.element(by.buttonText('Delete')).isPresent()).toBe(false);
    });


    it('should make a sick leave request',function() {
        h.addNew.click().then(function () {
            element(by.id('field_type')).sendKeys('Sick leave');
            h.startDate.sendKeys(h.dateString);
            expect(element(by.id('field_payment')).isEnabled()).toBe(false);
            expect(element(by.id('field_endDate')).isEnabled()).toBe(false);
            h.submit.click();
        });
        h.checkRequestData(h.vacationTypeColumn,/vacationTrackerApp.VacationType.SICK_LEAVE/);
        h.checkRequestData(h.vacationPaymentColumn,/vacationTrackerApp.PaymentType.WITH_NEXT_SALARY/);

        h.clickButton(h.vacationButtonColumn,'Send to confirmation');

        h.checkRequestData(h.vacationStageColumn,/vacationTrackerApp.Stage.PLANNED/);

        expect(h.vacationButtonColumn.element(by.buttonText('End date')).isPresent()).toBe(true);
    });

    it('should add end date to sick leave request', function() {
        h.clickButton(h.vacationButtonColumn,'End date');
        expect(element(by.id('field_startDate_sickLeave')).isEnabled()).toBe(false);
        element(by.id('field_endDate_sickLeave')).sendKeys(h.endDateString);
        h.submit.click();
        h.vacationDateColumn.getText().then(function(text) {
            expect(text).toMatch(h.dateString + ' - ' + h.endDateString);
        });
        expect(h.vacationButtonColumn.element(by.buttonText('End date')).isPresent()).toBe(false);
        expect(h.vacationButtonColumn.element(by.buttonText('Cancel request')).isPresent()).toBe(true);
        expect(h.vacationButtonColumn.element(by.buttonText('Delete')).isPresent()).toBe(false);

    });

    it('should make an extra vacation request', function() {
        h.addNew.click().then(function () {
            h.startDate.sendKeys(h.dateString);
            h.endDate.sendKeys(h.endDateString);
            h.submit.click();
        });
        h.clickButton(h.vacationButtonColumn,'Send to confirmation');
    });

    it('should check the vacation days left', function() {
        expect(element(by.id('paidDaysLeft')).getText()).toEqual('24');
    });

    it('should filter my vacation requests by type', function() {
        h.typeFilter.sendKeys('SICK_LEAVE');
        h.filter.click();
        expect(element.all(by.xpath('//table/tbody/tr')).count()).toEqual(1);
    });

    it('should filter overview requests by owner and type', function() {
        element.all(by.css('[ui-sref="overview"]')).first().click().then(function() {
            h.typeFilter.sendKeys('SICK_LEAVE');
            h.ownerFilter.sendKeys('user');
            h.filter.click();
            expect(element.all(by.xpath('//table/tbody/tr')).count()).toEqual(1);
        });
    });

    it( 'should log out with user user', function () {
        h.logout.click();
    });

    it('should log in with manager/admin user', function() {
        h.login('admin','admin');
    });

    it('should confirm request', function () {
        element.all(by.css('[ui-sref="overview"]')).first().click().then(function() {
            element.all(by.xpath('//table/tbody/tr')).count().then(function(originalCount) {
                var requests = originalCount;

                h.checkTitle('[ui-sref="manager"]','h2',/vacationTrackerApp.vacation.managerView.title/);

                element.all(by.xpath('//table/tbody/tr')).count().then(function(originalCount) {
                    var requests2 = originalCount;
                    h.clickButton(element(by.xpath('//table/tbody/tr[last()]/td[5]')),'Confirm');
                    var new_requests2 = element.all(by.xpath('//table/tbody/tr')).count();
                    expect(new_requests2).toBe(requests2 - 1);
                });
                element.all(by.css('[ui-sref="overview"]')).first().click().then(function(){
                    var new_requests = element.all(by.xpath('//table/tbody/tr')).count();
                    expect(new_requests).toBe(requests + 1);
                });
            });
        });

    });

    it('should reject request', function() {
        element.all(by.css('[ui-sref="overview"]')).first().click().then(function() {
            element.all(by.xpath('//table/tbody/tr')).count().then(function(originalCount) {
                var requests = originalCount;

                element.all(by.css('[ui-sref="manager"]')).first().click();
                element.all(by.xpath('//table/tbody/tr')).count().then(function(originalCount) {
                    var requests2 = originalCount;
                    h.clickButton(element(by.xpath('//table/tbody/tr[last()]/td[5]')),'Reject');
                    var new_requests2 = element.all(by.xpath('//table/tbody/tr')).count();
                    expect(new_requests2).toBe(requests2 - 1);
                });
                element.all(by.css('[ui-sref="overview"]')).first().click();
                var new_requests = element.all(by.xpath('//table/tbody/tr')).count();
                expect(new_requests).toBe(requests);
            });
        });
    });


/* TODO: For some reason admin cannot log back in after user has been logged in. It's possible we have to change user roles select type for this to work
    it('should give the user user manager role', function () {
        element(by.id('admin-menu')).click().then(function () {
            element(by.css('[ui-sref="user-management"]')).click().then(function () {
                element(by.css('[href="#/user-management/user/edit"]')).click();
                element(by.model('vm.user.authorities')).sendKeys('ROLE_MANAGER');
                element(by.id('editForm')).submit();
            });
        });
        logout.click();
        browser.get('/');
        username.sendKeys('user');
        password.sendKeys('user');
        submit.click();
        expect(element(by.css('[ui-sref="manager"]')).isDisplayed()).toBe(true);
        browser.get('/');
        logout.click();
    });

    it('should turn user role back to user', function() {
        browser.get('/');
        username.sendKeys('admin');
        password.sendKeys('admin');
        element(by.id('admin-menu')).click().then(function() {
            element(by.css('[ui-sref="user-management"]')).click().then(function () {
                element(by.css('[href="#/user-management/user/edit"]')).click();
                element(by.model('vm.user.authorities')).sendKeys('ROLE_USER');
                element(by.id('editForm')).submit();
            });
        });
    });
    */

    it('should log out with manager/admin user', function() {
        h.logout.click();
    });

    it('should log in with user user', function () {
        h.login('user','user');
    });

    it('should check the vacation days left after the rejection', function() {
        expect(element(by.id('paidDaysLeft')).getText()).toEqual('26');
    });

    it('should check that the request was rejected (i.e in SAVED state now) and delete the request', function() {
        element.all(by.css('[ui-sref="vacation"]')).first().click();

        h.checkRequestData(element(by.xpath('//table/tbody/tr[last()-2]/td[4]')),/vacationTrackerApp.Stage.SAVED/);

        element.all(by.xpath('//table/tbody/tr')).count().then(function(originalCount) {
            var requests = originalCount;
            h.clickAndSubmit(element(by.xpath('//table/tbody/tr[last()-2]/td[6]')),'Delete','deleteForm');
            var new_requests = element.all(by.xpath('//table/tbody/tr')).count();
            expect(new_requests).toBe(requests - 1);
        });
    });

    it('should cancel request', function() {
        element.all(by.css('[ui-sref="overview"]')).first().click().then(function() {
            element.all(by.xpath('//table/tbody/tr')).count().then(function(originalCount) {
                var requests = originalCount;
                element.all(by.css('[ui-sref="vacation"]')).first().click().then(function() {
                    h.clickAndSubmit(h.vacationButtonColumn,'Cancel request','cancelForm');
                    h.checkRequestData(h.vacationStageColumn,/vacationTrackerApp.Stage.SAVED/);
                });
                element.all(by.css('[ui-sref="overview"]')).first().click().then(function(){
                    var new_requests = element.all(by.xpath('//table/tbody/tr')).count();
                    expect(new_requests).toBe(requests - 1);
                });
            });
        });
    });

    it('should delete the other 2 requests', function() {
        element.all(by.css('[ui-sref="vacation"]')).first().click();
        element.all(by.xpath('//table/tbody/tr')).count().then(function(originalCount) {
            var requests = originalCount;
            h.clickAndSubmit(h.vacationButtonColumn,'Delete','deleteForm');
            h.clickAndSubmit(h.vacationButtonColumn,'Cancel request','cancelForm');
            h.clickAndSubmit(h.vacationButtonColumn,'Delete','deleteForm');
            var new_requests = element.all(by.xpath('//table/tbody/tr')).count();
            expect(new_requests).toBe(requests - 2);
        });
    });
});

