class ResultsController < ApplicationController
  skip_before_action :verify_authenticity_token

  CABIFY_LESS_THAN_15_FARE = 1.12
  CABIFY_MORE_THAN_15_FARE = 1.05
  CABIFY_TIME_FARE = 0
  CABIFY_BASE_FARE = 0
  UBER_KM_FARE = 0.65
  UBER_TIME_FARE = 0.1
  UBER_BASE_FARE = 1

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

    raise "No results found" unless result.present?

    result.distance *= 1.61

    @result = {
      uber: uber_results(result),
      cabify: cabify_results(result),
    }

    if @result[:uber][:average_estimate] > @result[:cabify][:average_estimate]
      @result.merge!(
        winner: {
          name: "cabify",
          estimate: @result[:cabify][:estimate],
          distance: @result[:uber][:distance] ,
          url: @result[:cabify][:url],
          km_fare: cabify_fare(@result[:uber][:distance]),
          time_fare: CABIFY_TIME_FARE,
          base_fare: CABIFY_BASE_FARE
        }
      )
    else
      @result.merge!(
        winner: {
          name: "uber",
          estimate: @result[:uber][:estimate],
          distance: @result[:uber][:distance],
          url: @result[:uber][:url],
          km_fare: UBER_KM_FARE,
          time_fare: UBER_TIME_FARE,
          base_fare: UBER_BASE_FARE
        }
      )
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
      estimate: result.estimate,
      url: "https://www.uber.com/invite/gbnl0"
    }
  end

  def cabify_results(result)
    estimate = (result.distance * cabify_fare(result.distance)).round(2)
    {
      distance: result.distance,
      average_estimate: estimate,
      estimate: "#{estimate} €",
      url: "https://cabify.com/i/uberoucabify"
    }
  end

  def cabify_fare(distance)
    distance > 15 ? CABIFY_MORE_THAN_15_FARE : CABIFY_LESS_THAN_15_FARE
  end

  def distance_in_km(distance)
    distance * 1.61
  end
end
