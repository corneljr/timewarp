angular.module('payment', [])

.service('PaymentService',['$http',function($http) {
    this.getToken = function(card) {
    	return $http({
    		url: "https://core.spreedly.com/v1/payment_methods.json?environment_key=KI0Ipgd5n7v1JgAN3JBR76yyVTV",
    		method: "POST",
    		data: card
    	})
    }

    this.chargeCard = function(token,amount, travellers, origin, destination, departure_date, return_date, tier) {
    	return $http({
    		url:'/api/charge_card',
    		method: "POST",
    		data: {'token': token, 'amount':amount, 'travellers': travellers, 'origin': origin, 'destination': destination, 'departure_date': departure_date, 'return_date':return_date, 'tier': tier, 'amount':amount}
    	})
    }

    this.payment_token;
    this.card_number;
    this.cardError;
}]);