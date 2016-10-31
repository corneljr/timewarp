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
	  	output_to_spreadsheet(params[:travellers], params[:origin], params[:destination], params[:departure_date],params[:return_date],params[:tier], params[:amount])
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

		flights = parse_flights(origin,destination,departure_date,return_date)

		render json: flights
	end
end
