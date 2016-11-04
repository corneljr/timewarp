angular.module('flights', [])

.service('Flights',['$http',function($http) {
    
  this.flightDetails;
  this.tripDetails;

  this.getFlights = function(origin,destination,departure_date,return_date,airline) {
  	url = '/api/get_flights?origin=' + origin + '&destination=' + destination + '&departure_date=' + departure_date + '&return_date=' + return_date + '&airline=' + airline;
      return $http({
        url: url,
        method: "GET",
        data: {origin: origin, destination: destination, departure_date: departure_date, return_date: return_date, airline: airline}
      })
  };
}]);