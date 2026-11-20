"""Refresh projects.json from the two public GitHub star lists."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.request import urlopen
import json
import re


class ListPage(HTMLParser):
    def __init__(self):
        super().__init__()
        self.repositories = []
        self.list_depth = 0
        self.in_heading = False
        self.expect_count = False
        self.count = None

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "svg" and attrs.get("aria-label") == "Repositories in this list":
            self.expect_count = True
        if tag == "div" and (self.list_depth or attrs.get("id") == "user-list-repositories"):
            self.list_depth += 1
        if self.list_depth and tag == "h2":
            self.in_heading = True
        if tag == "a" and self.in_heading:
            path = attrs.get("href", "")
            if re.fullmatch(r"/[\w.-]+/[\w.-]+", path):
                self.repositories.append(path[1:])

    def handle_endtag(self, tag):
        if tag == "h2":
            self.in_heading = False
        if tag == "div" and self.list_depth:
            self.list_depth -= 1

    def handle_data(self, data):
        if self.expect_count:
            match = re.fullmatch(r"\s*([\d,]+) repositor(?:y|ies)\s*", data)
            if match:
                self.count = int(match[1].replace(",", ""))
                self.expect_count = False


def read_list(slug):
    url = f"https://github.com/stars/fcavaletto/lists/{slug}"
    repositories = []
    page_number = 1
    while True:
        page = ListPage()
        with urlopen(f"{url}?page={page_number}", timeout=20) as response:
            page.feed(response.read().decode("utf-8"))
        if page.count is None:
            raise ValueError(f"Could not read the repository count for {slug}")
        if set(repositories).intersection(page.repositories):
            raise ValueError(f"Repeated repository while reading {slug}")
        repositories.extend(page.repositories)
        if len(repositories) == page.count and len(set(repositories)) == page.count:
            return repositories
        if not page.repositories or len(repositories) >= page.count:
            raise ValueError(f"Incomplete list for {slug}")
        page_number += 1


if __name__ == "__main__":
    lists = {slug: read_list(slug) for slug in ("completed", "research-in-progress")}
    output = Path(__file__).resolve().parents[1] / "projects.json"
    output.write_text(json.dumps(lists, indent=2) + "\n", encoding="utf-8")
