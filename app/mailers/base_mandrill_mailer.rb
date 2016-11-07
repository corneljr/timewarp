require "mandrill"

class BaseMandrillMailer < ActionMailer::Base
  default(
    from: "'Hopper Bookings' <bookings@hopper.com>"
  )

  private

  def send_mail(email, subject, body)
    mail(to: email, subject: subject, body: body, content_type: "text/html")
  end

  def mandrill_template(attributes)
    mandrill = Mandrill::API.new(ENV["mandrill_password"])

    merge_vars = attributes.map do |key, value|
      { name: key, content: value }
    end

    mandrill.templates.render("Timewarp Confirmation", [], merge_vars)["html"]
  end
end