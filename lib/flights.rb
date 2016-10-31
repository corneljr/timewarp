module Flights

	def parse_flights(origin,destination,departure_date,return_date)
		uri = URI("https://mobile-api.hopper.com/api/v1/cards?origin=#{origin}&destination=#{destination}&departure=#{departure_date}&return=#{return_date}")
		response = Net::HTTP.get(uri)
		parsed_response = JSON.parse(response)
		flights = parsed_response['cards'][0]['trips']
		forecast = parsed_response['cards'][1]['forecast']
		data = parsed_response['data']

		#########################################

		currentPrice = forecast['bestRecentPrice']
		targetPrice = forecast['targetPrice']
		availableDiscount = currentPrice - targetPrice

		origin_airport_code = origin.split('/').last
		origin_type = origin.split('/').first
		destination_airport_code = destination.split('/').last
		destination_type = destination.split('/').first

		if origin_type == 'airport'
			origin_city = data['airports'][data['airports'].find_index {|x| x['iata_code'] == origin_airport_code}]['served_entity']['name']
		else
			origin_city = data['airports'][data['airports'].find_index {|x| x['mac_iata_code'] == origin_airport_code}]['served_entity']['name']
		end

		if destination_type == 'airport'
			destination_city = data['airports'][data['airports'].find_index {|x| x['iata_code'] == destination_airport_code}]['served_entity']['name']
		else
			destination_city = data['airports'][data['airports'].find_index {|x| x['mac_iata_code'] == destination_airport_code}]['served_entity']['name']
		end

		flight_list = {'currentPrice' => currentPrice,
					   'targetPrice' => targetPrice,
					   'origin' => origin_city,
					   'destination' => destination_city, 
					   'departureDate' => departure_date,
					   'returnDate' => return_date,
					   'morning' => {'currentPrice' => currentPrice, 'tierPrice' => currentPrice - (availableDiscount * 0.3).to_i,'airlines' => [], 'outbound' => [], 'return' => []},
					   'afternoon' => {'currentPrice' => currentPrice, 'tierPrice' => currentPrice - (availableDiscount * 0.3).to_i,'airlines' => [], 'outbound' => [], 'return' => []},
					   'anytime' => {'currentPrice' => currentPrice, 'tierPrice' => currentPrice - (availableDiscount * 0.6).to_i,'airlines' => [], 'outbound' => [], 'return' => []},
					   'anytype' => {'currentPrice' => currentPrice, 'tierPrice' => currentPrice - (availableDiscount * 0.6).to_i,'airlines' => [], 'outbound' => [], 'return' => []},
					   'whatever' => {'currentPrice' => currentPrice, 'tierPrice' => currentPrice - (availableDiscount * 0.9).to_i,'airlines' => [], 'outbound' => [], 'return' => []}
					}

		flight_nums = []

		flights.each do |flight|

			['outbound','return'].each do |leg|

				flight_info = {}

				segment_flight_numbers = []

				flight['segments'].each do |segment|
					if segment['outgoing'] && leg == 'outbound'
						segment_flight_numbers << segment['flight_number']
					elsif !segment['outgoing'] && leg == 'return'
						segment_flight_numbers << segment['flight_number']
					end
				end

				if (flight_nums & segment_flight_numbers).empty?
					flight_nums.push(*segment_flight_numbers)
				else
					next
				end

				flight_info['stops'] = flight["#{leg}_stops"]
				departure_epoch_seconds = ((flight["#{leg}_departure_time"].to_i + flight["#{leg == 'outbound' ? 'return' : 'outbound'}_arrival_tz_offset"].to_i) / 1000)
				arrival_epoch_seconds = ((flight["#{leg}_arrival_time"].to_i + flight["#{leg == 'outbound' ? 'outbound' : 'return'}_arrival_tz_offset"].to_i) / 1000)

				duration = flight["#{leg}_duration"].to_i

				flight_info['airline'] = data['carriers'][data['carriers'].find_index {|x| x['code'] == flight['primary_carrier']}]['name']
				next if flight_info['airline'] == 'Frontier' || flight_info['airline'] == 'Spirit'

				flight_info['duration'] = "#{duration / 60}h #{duration % 60}m"
				flight_info['duration_minutes'] = duration
				flight_info['departureDay'] = DateTime.strptime(departure_epoch_seconds.to_s,"%s").strftime("%b %-d")
				flight_info['departureTime'] = DateTime.strptime(departure_epoch_seconds.to_s,"%s").strftime("%-l:%M%P")
				flight_info['arrivalDay'] = DateTime.strptime(arrival_epoch_seconds.to_s,"%s").strftime("%b %-d")
				flight_info['arrivalTime'] = DateTime.strptime(arrival_epoch_seconds.to_s,"%s").strftime("%-l:%M%P")

				airline_logo = ActionController::Base.helpers.image_url("#{flight["primary_carrier"]}_icon.png")

				flight_info['airline_image_url'] = airline_logo

				# check if there are long layovers/overnights
				tester = test_for_warnings(flight)

				flight_list['anytype']["#{leg}"] << flight_info	
				flight_list['anytype']['airlines'] << flight_info['airline'] unless flight_list['anytype']['airlines'].include?(flight_info['airline'])
				next if tester

				if flight_info['stops'] == 0
					flight_list['morning']["#{leg}"] << flight_info if flight_info['departureTime'].include?('am')
					flight_list['morning']['airlines'] << flight_info['airline'] if flight_info['departureTime'].include?('am') && !flight_list['morning']['airlines'].include?(flight_info['airline'])

					flight_list['afternoon']["#{leg}"] << flight_info if flight_info['departureTime'].include?('pm')
					flight_list['afternoon']['airlines'] << flight_info['airline'] if flight_info['departureTime'].include?('pm') && !flight_list['afternoon']['airlines'].include?(flight_info['airline'])
				end

				if flight_info['stops'] < 2
					flight_list['anytime']["#{leg}"] << flight_info
					flight_list['anytime']['airlines'] << flight_info['airline'] unless flight_list['anytime']['airlines'].include?(flight_info['airline'])
				end

				# leave this here for now and figure out how to handle 
				flight_list['whatever']["#{leg}"] << flight_info
				flight_list['whatever']['airlines'] << flight_info['airline'] unless flight_list['whatever']['airlines'].include?(flight_info['airline'])
			end
		end

		flight_list
	end

	def test_for_warnings(flight)
		tester = false
		flight['trip_warnings']['sliceInfos'].each do |slice|
			slice['warnings'].each do |warning|
				if warning['level'] == 'high'
					tester = true
				end
			end
		end

		return tester
	end
end