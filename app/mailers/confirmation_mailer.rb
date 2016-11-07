class ConfirmationMailer < ActionMailer::Base
	default from: 'josh@hopper.com'

	def send_confirmation(email)
		@email = email
		mail(to: email, subject: 'Your Hopper Receipt')
	end
end
