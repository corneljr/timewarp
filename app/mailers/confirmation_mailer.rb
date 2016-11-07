class ConfirmationMailer < BaseMandrillMailer

	def send_confirmation(email,traveller_count,origin,destination,departure_date,return_date,amount,booking_id)
		subject = "Your Hopper Receipt"

		merge_vars = {
			"booking_number" => booking_id,
			"destination" => destination.split('/').last,
			"departure_date" => departure_date,
			"origin" => origin.split('/').last,
			"return_date" => return_date,
			"traveller_count" => traveller_count,
			"total_cost" => amount
		}

		body = mandrill_template(merge_vars)
		send_mail(email, subject, body)
	end
end
