# encoding: utf-8

require 'sinatra'

set :port, 80
cwd = File.dirname __FILE__

get '/lacuna/*' do |fname|
    # send_file handles the response Content-Type header properly.
    send_file File.expand_path(fname, cwd)
end
