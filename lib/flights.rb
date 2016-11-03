module Flights

	def parse_flights(origin,destination,departure_date,return_date)
		uri = URI("https://mobile-api.hopper.com/api/v1/cards?origin=#{origin}&destination=#{destination}&departure=#{departure_date}&return=#{return_date}")
		response = Net::HTTP.get(uri)
		parsed_response = JSON.parse(response)
		flights = parsed_response['cards'][0]['trips']
		forecast = parsed_response['cards'][1]['forecast']
		data = parsed_response['data']

		#########################################

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

		flight_list = {'currentPrice' => forecast['bestRecentPrice'],
					   'targetPrice' => forecast['targetPrice'],
					   'origin' => origin_city,
					   'destination' => destination_city, 
					   'departureDate' => departure_date,
					   'returnDate' => return_date,
					   'outbound' => [],
					   'return' => [],
					   'trip_prices' => {}
					}

		outbound_details = {}
		return_details = {}

		flights.each do |flight|
			next if test_for_warnings(flight) || flight['carriers'] != ["UA"]

			['outbound','return'].each do |leg|
				duration = flight["#{leg}_duration"].to_i
				duration_string = "#{duration / 60}h #{duration % 60}m"

				departure_epoch_seconds = ((flight["#{leg}_departure_time"].to_i + flight["#{leg == 'outbound' ? 'return' : 'outbound'}_arrival_tz_offset"].to_i) / 1000)
				arrival_epoch_seconds = ((flight["#{leg}_arrival_time"].to_i + flight["#{leg == 'outbound' ? 'outbound' : 'return'}_arrival_tz_offset"].to_i) / 1000)

				details = {'duration' => duration_string,
						   'departureDay' => DateTime.strptime(departure_epoch_seconds.to_s,"%s").strftime("%b %-d"),
						   'departureTime' => DateTime.strptime(departure_epoch_seconds.to_s,"%s").strftime("%-l:%M%P"),
						   'arrivalDay' => DateTime.strptime(arrival_epoch_seconds.to_s,"%s").strftime("%b %-d"),
						   'arrivalTime' => DateTime.strptime(arrival_epoch_seconds.to_s,"%s").strftime("%-l:%M%P"),
						   'stops' => flight["#{leg}_stops"], 
						   'airline' => data['carriers'][data['carriers'].find_index {|x| x['code'] == flight['primary_carrier']}]['name'], 
						   'airlineImageUrl' => ActionController::Base.helpers.image_url("#{flight["primary_carrier"]}_icon.png"),
						   'flights' => []}

				if leg == 'outbound'
					outbound_details = details
				else
					return_details = details
				end
			end

			segment_length = flight['segments'].length
			trip_id = ''
			trip_price = flight['total_amount']
			outbound_ids = ''
			return_ids = ''
			counter = 0

			flight['segments'].each_with_index do |segment,index|
				flight_info = {}
				leg = segment['outgoing'] ? 'outbound' : 'return'

				trip_id = trip_id + segment['carrier_code'] + segment['flight_number']
				flight_list['trip_prices'][trip_id] = trip_price if segment_length - 1 == index

				departure_epoch_seconds = ((segment["segment_departure_time"].to_i + segment["segment_departure_tz_offset"].to_i) / 1000)
				arrival_epoch_seconds = ((segment["segment_arrival_time"].to_i + segment["segment_arrival_tz_offset"].to_i) / 1000)

				flight_info['segmentOrigin'] = segment['segment_origin']
				flight_info['segmentOriginString'] = data['airports'][data['airports'].find_index {|x| x['iata_code'] == segment['segment_origin']}]['served_entity']['name']
				flight_info['segmentDestination'] = segment['segment_destination']
				flight_info['segmentDestinationString'] = data['airports'][data['airports'].find_index {|x| x['iata_code'] == segment['segment_destination']}]['served_entity']['name']
				flight_info['id'] = segment['carrier_code'] + segment['flight_number']
				flight_info['segmentDepartureDay'] = DateTime.strptime(departure_epoch_seconds.to_s,"%s").strftime("%b %-d")
				flight_info['segmentDepartureTime'] = DateTime.strptime(departure_epoch_seconds.to_s,"%s").strftime("%-l:%M%P")
				flight_info['segmentArrivalDay'] = DateTime.strptime(arrival_epoch_seconds.to_s,"%s").strftime("%b %-d")
				flight_info['segmentArrivalTime'] = DateTime.strptime(arrival_epoch_seconds.to_s,"%s").strftime("%-l:%M%P")

				if leg == 'outbound'
					outbound_ids = outbound_ids + segment['carrier_code'] + segment['flight_number'] 
					outbound_details['outbound_ids'] = outbound_ids
					outbound_details['flights'] << flight_info
				else
					return_ids = return_ids + segment['carrier_code'] + segment['flight_number'] 
					return_details['return_ids'] = return_ids
					return_details['flights'] << flight_info
				end
			end

			unless flight_list['trip_prices'][outbound_ids]
				flight_list['trip_prices'][outbound_ids] = trip_price
				flight_list['outbound'] << outbound_details
			end

			unless flight_list['trip_prices'][return_ids]
				flight_list['trip_prices'][return_ids] = trip_price
				flight_list['return'] << return_details
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