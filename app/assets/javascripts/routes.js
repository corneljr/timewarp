angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('home', {
    url: '/home',
    templateUrl: 'home.html',
    controller: 'homeCtrl'
  })

  .state('timewarp', {
    url: '/timewarp',
    templateUrl: 'timewarp.html',
    controller: 'timewarpCtrl'
  })

  .state('addTravellers', {
    url: '/add-travellers/:type',
    templateUrl: 'addTravellers.html',
    controller: 'addTravellersCtrl'
  })

  .state('payment', {
    cache: false,
    url: '/payment/:type',
    templateUrl: 'payment.html',
    controller: 'paymentCtrl'
  })

  .state('reviewFarePurchase', {
    url: '/review/:type',
    templateUrl: 'reviewFarePurchase.html',
    controller: 'reviewFarePurchaseCtrl'
  })

  .state('flightDetails', {
    url: '/page5/:type',
    templateUrl: 'flightDetails.html',
    controller: 'flightDetailsCtrl'
  })

$urlRouterProvider.otherwise('/home')

  

});