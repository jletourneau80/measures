source :gemcutter


#gem 'quality-measure-engine', '1.0.4'
#gem 'quality-measure-engine', :path=>'../quality-measure-engine'
gem 'quality-measure-engine', :path => '../quality-measure-engine'
#gem 'quality-measure-engine', '1.1.1'
gem 'health-data-standards', :git => 'https://github.com/projectcypress/health-data-standards.git', :branch => 'develop'

gem 'activemodel', '3.1.3'

gem 'mongo', '1.5.1'
gem 'bson_ext', '1.5.1',  :platforms => :mri
gem 'rake'

gem 'pry'

gem 'rspec'


group :test do
  gem 'jsonschema'
  gem 'awesome_print', :require => 'ap'
  gem 'sinatra'
  gem 'roo'
  gem 'builder'
  gem 'spreadsheet'
  gem 'google-spreadsheet-ruby'
end

group :build do
  gem 'yard'
  gem 'kramdown' # needed by yard
end
