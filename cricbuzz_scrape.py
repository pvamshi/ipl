import json
import re
from urllib.request import urlopen

from bs4 import BeautifulSoup

domain = "https://www.cricbuzz.com"


def pretty_print(obj):
    print(json.dumps(obj, indent=4, sort_keys=True))


def init():
    connection = urlopen(
        domain + "/cricket-series/2676/indian-premier-league-2018/matches")
    html_doc = connection.read()
    soup = BeautifulSoup(html_doc, "lxml")

    series = soup.find(id='series-matches')
    matches = series.select('a.cb-text-complete')
    result = []
    for match in matches:
        result.append(scrape_match(match))

    pretty_print(result)
    connection.close()


def scrape_match(match):
    temp_url = match.get('href').replace(
        'cricket-scores', 'live-cricket-scorecard')
    temp_con = urlopen(domain + temp_url)
    temp_html = temp_con.read()
    data = fetch_data(temp_html)
    temp_con.close()
    return data


def fetch_data(html_txt):
    temp_soup = BeautifulSoup(html_txt, 'lxml')
    result = {}
    result.update(get_meta(temp_soup))
    return result


def get_meta(temp_soup):
    '''
      TODO: Somehow add playing and bench players
    '''
    meta_component = list(temp_soup.select(
        '#page-wrapper .cb-scrd-lft-col > div'))[3]
    values = list(meta_component.select('.cb-col-73'))

    _a, _b, series, year = values[0].get_text().split(',')

    toss_regexp_match = re.match(
        r'(.*) won the toss and opt to (.*)', values[2].get_text())

    winner = list(temp_soup.select('.cb-scrcrd-status'))[0]
    winner_regexp_match = re.match(
        r'(.*) won by (\d+) (.*)', winner.get_text())
    win_by_wkt = winner_regexp_match.group(3).startswith('wkt')
    win_by = int(winner_regexp_match.group(2))

    teams = list(temp_soup.select('.cb-minfo-tm-nm'))
    team1 = teams[0].get_text().split('\xa0')[0].strip()
    team2 = teams[3].get_text().split('\xa0')[0].strip()

    titles = list(temp_soup.select('.cb-scrd-hdr-rw'))
    temp_team1_spans = titles[0].select('span')[0].get_text()

    if(titles[0].select('span')[0].get_text() == team1+' Innings'):
        team1_score, team1_wickets_lost, team1_overs_played = get_score(
            titles[0].select('span')[1].get_text())
        team2_score, team2_wickets_lost, team2_overs_played = get_score(
            titles[1].select('span')[1].get_text())
    else:
        team1_score, team1_wickets_lost, team1_overs_played = get_score(
            titles[1].select('span')[1].get_text())
        team2_score, team2_wickets_lost, team2_overs_played = get_score(
            titles[0].select('span')[1].get_text())

    return {'date': values[1].get_text().strip(),
            'series': series.strip(),
            'season': year.strip(),
            'time': values[3].get_text().strip(),
            'venue': values[4].get_text().strip(),
            'umpire1': values[5].get_text().split(',')[0].strip(),
            'umpire2': values[5].get_text().split(',')[1].strip(),
            'umpire3': values[6].get_text().strip(),
            'match_referee': values[7].get_text().strip(),
            'team1': team1,
            'team2': team2,
            'toss_winner': toss_regexp_match.group(1).strip(),
            'toss_decision': toss_regexp_match.group(2).strip(),
            'winning_team': winner_regexp_match.group(1),
            'win_by_runs': 0 if win_by_wkt else win_by,
            'win_by_wkts': win_by if win_by_wkt else 0,
            'team1_score': team1_score,
            'team1_wickets_lost': team1_wickets_lost,
            'team1_overs_played': team1_overs_played,
            'team2_score': team2_score,
            'team2_wickets_lost': team2_wickets_lost,
            'team2_overs_played': team2_overs_played,
            }


def get_score(strp):
    data_regex = re.match(r'(\d+)-(\d+)\xa0\((.*)\)', strp.strip())
    total_score = int(data_regex.group(1))
    total_wickets = int(data_regex.group(2))
    overs = float(data_regex.group(3))
    overs = int(overs) + round(((overs*10) % 10)/6, 2)
    return total_score, total_wickets, overs


if __name__ == "__main__":
    init()
