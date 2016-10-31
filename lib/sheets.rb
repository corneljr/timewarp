module Sheets
	def output_to_spreadsheet(travellers,origin,destination,departure_date,return_date,tier,amount)
		booking_id = "TW" + SecureRandom.random_number(1_000_000).to_s

		session = GoogleDrive::Session.from_config("config.json")
		ws = session.spreadsheet_by_key("1boz24dpqMK0btRTL0XifIURNP0ae9WREm7LDzxrd2XU").worksheets[0]

		travellers.each do |traveller|
			sheet_hash = {"First Name" => traveller["firstName"], "Last Name" => traveller["lastName"], "Birthdate" => traveller["birthday"],"Gender" => traveller["gender"], "Email" => traveller["email"], "Origin" => origin, "Destination" => destination, "Departure Date" => departure_date, "Return Date" => return_date, "Tier" => tier, "Amount" => amount, "Booking ID" => booking_id, "Booking Date" => Time.now.strftime("%F")}
			ws.list.push(sheet_hash)
		end

		ws.save
	end
end