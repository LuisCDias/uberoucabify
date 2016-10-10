class ResultsController < ApplicationController
  skip_before_action :verify_authenticity_token

  CABIFY_LESS_THAN_15_MULTIPLIER = 1.12
  CABIFY_MORE_THAN_15_MULTIPLIER = 1.05

  def create
    client = Uber::Client.new do |config|
      config.server_token  = ENV["UBER_SERVER_TOKEN"]
      config.client_id     = ENV["UBER_CLIENT_ID"]
      config.client_secret = ENV["UBER_CLIENT_SECRET"]
      config.sandbox       = true
    end

    result = client.price_estimations(
      start_latitude: params[:slat],
      start_longitude: params[:slon],
      end_latitude: params[:dlat],
      end_longitude: params[:dlon]
    ).first

    @result = {
      uber: uber_results(result),
      cabify: cabify_results(result),
    }

    if @result[:uber][:average_estimate] > @result[:cabify][:estimate]
      @result.merge!({winner: "cabify"})
    else
      @result.merge!({winner: "uber"})
    end
    render json: @result
  end

  private

  def uber_results(result)
    {
      distance: result.distance,
      low_estimate: result.low_estimate,
      high_estimate: result.high_estimate,
      average_estimate: (result.high_estimate + result.low_estimate) / 2,
      estimate: result.estimate
    }
  end

  def cabify_results(result)
    estimate = result.distance * (result.distance > 15 ? CABIFY_MORE_THAN_15_MULTIPLIER : CABIFY_LESS_THAN_15_MULTIPLIER)
    {
      distance: result.distance,
      estimate: estimate
    }
  end
end
