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

  .state('outbound', {
    url: '/outbound',
    templateUrl: 'outbound.html',
    controller: 'outboundCtrl'
  })

  .state('return', {
    url: '/return',
    templateUrl: 'return.html',
    controller: 'returnCtrl'
  })

  .state('tripSummary', {
    url: '/trip-summary',
    templateUrl: 'tripSummary.html',
    controller: 'tripSummaryCtrl'
  })

  .state('addTravellers', {
    url: '/add-travellers',
    templateUrl: 'addTravellers.html',
    controller: 'addTravellersCtrl'
  })

  .state('payment', {
    cache: false,
    url: '/payment',
    templateUrl: 'payment.html',
    controller: 'paymentCtrl'
  })

  .state('reviewFarePurchase', {
    url: '/review',
    templateUrl: 'reviewFarePurchase.html',
    controller: 'reviewFarePurchaseCtrl'
  })

$urlRouterProvider.otherwise('/home')

  

});