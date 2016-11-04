module Sheets
	def output_to_spreadsheet(travellers,origin,destination,departure_date,return_date,amount,outbound_flights,return_flights)
		booking_id = "TW" + SecureRandom.random_number(1_000_000).to_s

		session = GoogleDrive::Session.from_config("config.json")
		ws = session.spreadsheet_by_key("1Z6jd63gBn28BRzqO63kA6Y95To9nDRNyFNQ3LXQzRDg").worksheets[0]

		travellers.each do |traveller|
			sheet_hash = {"First Name" => traveller["firstName"], "Last Name" => traveller["lastName"], "Birthdate" => traveller["birthday"],"Gender" => traveller["gender"], "Email" => traveller["email"], "Origin" => origin, "Destination" => destination, "Departure Date" => departure_date, "Return Date" => return_date, "Amount" => amount, "Booking ID" => booking_id, "Booking Date" => Time.now.strftime("%F"), "Outbound Flights" => outbound_flights, "Return Flights" => return_flights}
			ws.list.push(sheet_hash)
		end

		ws.save
	end
end