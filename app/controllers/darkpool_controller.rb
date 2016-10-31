class DarkpoolController < ApplicationController
	require 'net/http'
	require 'uri'
	require 'json'

  def index
  	render layout: false
  end
end
