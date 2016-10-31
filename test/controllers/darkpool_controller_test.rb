require 'test_helper'

class DarkpoolControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get darkpool_index_url
    assert_response :success
  end

end
