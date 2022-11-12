library(tidyverse)

albums <- read_rds("./Wasabi/albums_all_artists_3000.rds")
albums <- albums %>%
    select(genre, publicationDate, country) %>%
    mutate(date = publicationDate) %>%
    mutate(country_code = country) %>%
    select(genre, country_code, date)

albums$date <- albums$date %>% replace_na("Inconu")
albums$country_code <- albums$country_code %>% replace_na("Inconu") %>% replace(.=="NULL", "Inconu") %>% replace(.=="", "Inconnu")
albums$genre <- albums$genre %>% replace_na("Inconu") %>% replace(.=="", "Inconu")


countries <- read.csv2("./Wasabi/world.csv") %>%
    select(FrenchName, ISO3166_1Alpha2Codes, RegionOfTheTerritory, ContinentOfTheTerritory) %>%
    mutate(country_code = ISO3166_1Alpha2Codes) %>%
    mutate(country_name = FrenchName) %>%
    mutate(region = RegionOfTheTerritory) %>%
    mutate(continent = ContinentOfTheTerritory) %>%
    select(country_name, region, continent, country_code) %>%
    filter(!is.na(country_name) & !is.na(region) & !is.na(continent) & !is.na(country_code))

##countries$country_code <- countries$country_code


data <- albums %>%
    group_by(genre, country_code, date) %>%
    summarise(count = n())

albums_countries <- data %>% 
    left_join(countries, keep = FALSE)

albums_countries$country_name <- albums_countries$country_name %>% replace_na("Inconnu")
albums_countries$region <- albums_countries$region %>% replace_na("Inconnu")
albums_countries$continent <- albums_countries$continent %>% replace_na("Inconnu")

albums_countries <- albums_countries %>% mutate(count = as.character(count))

write.csv2(albums_countries, "./result.csv", row.names = FALSE)
