angular.module('app.controllers', [])

.controller('homeCtrl', ['$scope', '$stateParams', '$timeout', '$window','Flights', '$state', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $timeout, $window, Flights, $state) {
    $scope.dataLoaded = false;
    $scope.letsDoThis = function() {
        $state.go('timewarp',{'type':$scope.flightType});
    }

    $scope.bunnyIndex = 1
    $scope.bunnyUrl = ''
    $scope.expiryDate = new Date("2016-11-01")
    $scope.countdown = "";

    var dateTicker = function() {
      ms = $scope.expiryDate - Date.now();
      d = parseInt(ms / (1000 * 60 * 60 * 24));
      h = parseInt((ms % (1000 * 60 * 60 * 24)) / (1000*60*60) );
      m = parseInt(((ms % (1000 * 60 * 60 * 24)) % (1000*60*60)) / (1000*60));
      s = parseInt((((ms % (1000 * 60 * 60 * 24)) % (1000*60*60)) % (1000*60)) / (1000));
      $scope.countdown = d + 'd ' + h + 'h ' + m + 'm ' + s + 's ';
      $timeout(dateTicker,10);
    }

    $timeout(dateTicker,10);

    var runBunny = function() {
      if ($scope.bunnyIndex == 13){
        $scope.bunnyIndex = 1;
      } else {
        $scope.bunnyIndex+=1;        
      }
      string = "image-" + $scope.bunnyIndex
      $scope.bunnyUrl = document.getElementById('image-data').dataset[string];
      $timeout(runBunny,50);
    }

    $timeout(runBunny, 50);

    $scope.getParameterByName = function(name) {
      url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    Flights.tripDetails = {'origin': $scope.getParameterByName('origin'),'destination': $scope.getParameterByName('destination'), 'departureDate': $scope.getParameterByName('departure'), 'returnDate': $scope.getParameterByName('return')}
    $scope.tripDetails = Flights.tripDetails;
    promise = Flights.getFlights($scope.tripDetails.origin,$scope.tripDetails.destination,$scope.tripDetails.departureDate,$scope.tripDetails.returnDate);
    promise.then( function(response){
      Flights.flightDetails = response.data;
      $scope.flightDetails = Flights.flightDetails;
      $scope.dataLoaded = true;
      mixpanel.register({"origin":$scope.flightDetails['origin'],"destination":$scope.flightDetails['destination'],"departure_date":$scope.flightDetails['departureDate'],"return_date":$scope.flightDetails['return_date']})
      mixpanel.track("timewarp-launched_timewarp")
    }, function(error_response) {
      console.log(error_response);
    });
}])

  
.controller('timewarpCtrl', ['$scope','$window','$stateParams','$timeout','Flights', '$ionicModal', '$state', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope,$window,$stateParams,$timeout,Flights, $ionicModal, $state) {

    if (!Flights.flightDetails) {
      $window.location = $window.location.origin + $window.location.search
    }

    mixpanel.track("timewarp-completed_onboarding")

    $scope.flightDetails = Flights.flightDetails;
    $scope.tripDetails = Flights.tripDetails;
    $scope.tiers = Flights.tiers.slice(1,5)

    $scope.getParameterByName = function(name) {
      url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    };
    
    $ionicModal.fromTemplateUrl('howItWorks.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
      });
      $scope.openModal = function() {
        mixpanel.track("timewarp-viewed_howitworks")
        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };
      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });
      // Execute action on hide modal
      $scope.$on('modal.hidden', function() {
        // Execute action
      });
      // Execute action on remove modal
      $scope.$on('modal.removed', function() {
        // Execute action
      });
      
    $scope.flightBreakdown = function(type) {
        $state.go('flightDetails',{'type':type})
    }
    
    $scope.slideChanged = function(index) {
      $scope.slideIndex = index;
    };
}])
   
.controller('addTravellersCtrl', ['$scope', '$stateParams', '$state', '$window','TravellerService', 'Flights', '$ionicModal', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, $window,TravellerService, Flights, $ionicModal) {

    if (!Flights.flightDetails) {
      $window.location = $window.location.origin + $window.location.search
    }

    $scope.savedTravellers = TravellerService.travellers;
    $scope.travellersCount = 0
    $scope.flightType = $stateParams.type;
    $scope.flightList = Flights.flightDetails[$scope.flightType];
    $scope.tripDetails = Flights.tripDetails;

    $scope.totalCost = function() {
      if ($scope.savedTravellers) {
        return $scope.flightList.tierPrice * $scope.savedTravellers.length  
      } else {
        return 0
      }
    }

    mixpanel.track("timewarp-confirm_tier",{'tier_type':$scope.flightType});
    
    $scope.genders = [
        {
            'id':'male',
            'label':'Male'
        },
        {
            'id':'female',
            'label':'Female'
        }
    ]
    
    $scope.new_traveller = {
        
        'firstName':'',
        'middleName':'',
        'lastName':'',
        'birthday':'',
        'gender': $scope.genders[0].id,
        'email':''
    }
    
    $scope.addTraveller = function(travellerForm){
        if (TravellerService.travellers) {
            TravellerService.travellers.push($scope.new_traveller);    
        } else {
            TravellerService.travellers = [$scope.new_traveller];
        }
        travellerForm.$setPristine();
        $scope.savedTravellers = TravellerService.travellers;
        $scope.travellersCount = $scope.savedTravellers.length;
        $scope.closeModal();
        $scope.clearTravellerInfo();
    }
    
    $scope.openTravellerModal = function() {
        
        $scope.openModal();
        
    }
    
    $scope.clearTravellerInfo = function() {
        
        $scope.new_traveller = {
            
            'firstName':'',
            'middleName':'',
            'lastName':'',
            'birthday':'',
            'gender': $scope.genders[0].id,
            'email':''
        }
    }
    
    $scope.payment = function() {
        $state.go('payment', {'type':$scope.flightType});
    }
    
    $ionicModal.fromTemplateUrl('addTraveller.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
      });
      $scope.openModal = function() {
        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };
      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });
      // Execute action on hide modal
      $scope.$on('modal.hidden', function() {
        // Execute action
      });
      // Execute action on remove modal
      $scope.$on('modal.removed', function() {
        // Execute action
      });

}])
   
.controller('paymentCtrl', ['$scope', '$stateParams','$location','TravellerService', 'Flights', '$state','$window', 'PaymentService', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $location, TravellerService, Flights, $state, $window, PaymentService) {
    
    if (!Flights.flightDetails) {
      $window.location = $window.location.origin + $window.location.search
    }

    $scope.travellers = TravellerService.travellers;
    $scope.flightType = $stateParams.type;
    $scope.flightDetails = Flights.flightDetails
    $scope.flightList = Flights.flightDetails[$scope.flightType];
    $scope.tripDetails = Flights.tripDetails;
    $scope.formErrors = []

    $scope.totalCost = $scope.flightList.tierPrice * $scope.travellers.length
    $scope.cardError = PaymentService.cardError;

    mixpanel.track("timewarp-finished_adding_travellers",{'tier_type':$scope.flightType})

    $scope.submitPaymentForm = function() {
      firstName = $scope.cardData.name.split(' ')[0];
      lastName = $scope.cardData.name.split(' ')[1];
      month = $scope.cardData.expiry.split('/')[0];
      year = $scope.cardData.expiry.split('/')[1]

      var card = {
        "payment_method":{
          "credit_card":{
            "first_name": firstName,
            "last_name": lastName,
            "number":$scope.cardData.cardNumber,
            "verification_value": $scope.cardData.cvc,
            "month":month,
            "year":year,
            "email": $scope.travellers[0].email
          },
          "data": {
            "my_payment_method_identifier": "448",
            "extra_stuff": {
              "some_other_things": "Can be anything really"
            }
          }
        }
      } 

      promise = PaymentService.getToken(card);
      promise.then( function(response){
        token = response['data']['transaction']['payment_method']['token']
        PaymentService.payment_token = token;
        PaymentService.card_number = response['data']['transaction']['payment_method']['number'];
        $state.go('reviewFarePurchase', {'type':$scope.flightType});
      }, function(error_response) {
        $scope.formErrors = error_response['data']['errors']
      });
    };
    
    $scope.countries = [
        {
            'id':'canada',
            'label':'Canada'
        },
        {
            'id':'unitedstates',
            'label':'United States'
        }
    ]
    
    $scope.cardData = {
        'cardNumber': '',
        'expiry': '',
        'cvc': '',
        'country': $scope.countries[0].id,
        'zipCode': '',
        'name': ''
    }
}])
   
.controller('reviewFarePurchaseCtrl', ['$scope', '$state', '$window','$stateParams', 'TravellerService', '$ionicModal', '$ionicHistory','Flights','PaymentService', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $state, $window, $stateParams, TravellerService, $ionicModal, $ionicHistory,Flights,PaymentService) {

    if (!Flights.flightDetails) {
      $window.location = $window.location.origin + $window.location.search
    }

    $scope.savedTravellers = TravellerService.travellers;
    $scope.flightType = $stateParams.type;
    $scope.flightDetails = Flights.flightDetails;
    $scope.flightList = Flights.flightDetails[$scope.flightType];
    $scope.totalCost = $scope.flightList.tierPrice * $scope.savedTravellers.length;
    console.log('total: ' + $scope.totalCost)
    $scope.tripDetails = Flights.tripDetails;
    $scope.token = PaymentService.payment_token;
    $scope.card = PaymentService.card_number;
    $scope.tripType = Flights.tierDetails($scope.flightType)

    mixpanel.track("timewarp-finished_adding_payment",{'tier_type':$scope.flightType})
    
    $scope.confirmation = function() {
        document.getElementById('reviewFarePurchase-button5').disabled = true;
        promise = PaymentService.chargeCard(PaymentService.payment_token,$scope.totalCost, $scope.savedTravellers, $scope.tripDetails['origin'], $scope.tripDetails['destination'], $scope.tripDetails['departureDate'], $scope.tripDetails['returnDate'], $scope.flightType)
        promise.then( function(response){
          if (response['data']['success']) {
            mixpanel.track("timewarp-completed_booking",{'tier_type':$scope.flightType})
            $scope.openModal();
            //do something to confirm purchase
          } else {
            document.getElementById('reviewFarePurchase-button5').disabled = true;
            PaymentService.cardError = true
            $ionicHistory.goBack();
          }
        }, function(error_response) {
          console.log('nopeee');
          console.log(error_response);
        });
    };
    
    $ionicModal.fromTemplateUrl('confirmation.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
      });
      $scope.openModal = function() {
        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };
      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });
      // Execute action on hide modal
      $scope.$on('modal.hidden', function() {
        // Execute action
      });
      // Execute action on remove modal
      $scope.$on('modal.removed', function() {
        // Execute action
      });
 
}])
   
.controller('flightDetailsCtrl', ['$scope', '$stateParams', '$window','Flights', '$ionicModal', '$state', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $window, Flights, $ionicModal, $state) {

    if (!Flights.flightDetails) {
      $window.location = $window.location.origin + $window.location.search
    }
    
    $scope.flightType = $stateParams.type;
    $scope.flightDetails = Flights.flightDetails
    $scope.flightList = Flights.flightDetails[$scope.flightType];
    $scope.tripDetails = Flights.tripDetails;
    $scope.tierDetails = Flights.tierDetails($scope.flightType);

    $scope.maxDuration = Math.max.apply(Math,$scope.flightList['outbound'].map(function(f){return f['duration_minutes']}));
    $scope.maxDurationString = parseInt($scope.maxDuration / 60) + "h " + $scope.maxDuration % 60 + "m"

    var savings_amount = $scope.flightDetails[$scope.flightType]['currentPrice'] - $scope.flightDetails[$scope.flightType]['tierPrice']
    mixpanel.track("timewarp-selected_tier",{'tier_type':$scope.flightType, 'savings_amount': savings_amount})
    
    $scope.bookNow = function() {
        $state.go('addTravellers',{'type':$scope.flightType});
    }
    
    $ionicModal.fromTemplateUrl('howItWorks.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
      });
      $scope.openModal = function() {
        $scope.modal.show();
        mixpanel.track("timewarp-viewed_flight_list",{'tier_type':$scope.flightType})
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };
      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });
      // Execute action on hide modal
      $scope.$on('modal.hidden', function() {
        // Execute action
      });
      // Execute action on remove modal
      $scope.$on('modal.removed', function() {
        // Execute action
      });
      
    $scope.slideChanged = function(index) {
      $scope.slideIndex = index;
    };

    $scope.titleText = function(leg) {
      if(leg == 'outbound') {
        return 'Departure flight';
      } else {
        return 'Return flight';
      };
    }
}])
 