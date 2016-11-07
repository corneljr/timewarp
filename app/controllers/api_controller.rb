class ApiController < ApplicationController
	include Flights
	include Sheets

	def charge_card
		token = params["token"]
		amount = params["amount"].to_i * 100
		uri = URI.parse("https://core.spreedly.com/v1/gateways/#{ENV['spreedly_gateway_token']}/purchase.json")
		request = Net::HTTP::Post.new(uri)
		request.basic_auth(ENV['spreedly_key'], ENV['spreedly_secret'])
		request.content_type = "application/json"

		request.body = JSON.dump({
		  "transaction" => {
		    "payment_method_token" => token,
		    "amount" => amount,
		    "currency_code" => "USD",
		    "retain_on_success" => true
		  }
		})

		response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https") do |http|
			http.request(request)
		end
	
	  parsed_response = JSON.parse(response.body)

	  if parsed_response["transaction"]["succeeded"]
	  	booking_id = "TWN" + SecureRandom.random_number(1_000_000).to_s
	  	output_to_spreadsheet(params[:travellers], params[:origin], params[:destination], params[:departure_date],params[:return_date], params[:amount], params[:outbound_flights], params[:return_flights],booking_id)

	  	params[:travellers].each do |traveller|
	  		ConfirmationMailer.send_confirmation(traveller["email"], params[:travellers].count, params[:origin], params[:destination], params[:departure_date], params[:return_date], params[:amount], booking_id).deliver
	  	end

	  	render json: {success: true}
	  else
	  	render json: {success: false}
	  end
	end

	def get_flights
		origin = params[:origin]
		destination = params[:destination]
		departure_date = params[:departure_date]
		return_date = params[:return_date]
		airline = params[:airline]

		flights = parse_flights(origin,destination,departure_date,return_date,airline)
		render json: flights
	end
end
