
class GildedRose(object):
    AGED_BRIE = "Aged Brie"
    BACKSTAGE_PASS = "Backstage passes to a TAFKAL80ETC concert"
    SULFURAS = "Sulfuras, Hand of Ragnaros"
    CONJURED = "Conjured mana cake"
    MAX_QUALITY = 50
    MIN_QUALITY = 0

    def __init__(self, items):
        self.items = items

    def update_quality(self):
        for item in self.items:
            self.update_sell_in(item)
            self.update_quality_value(item)

    def update_sell_in(self, item):
        if item.name != self.SULFURAS:
            item.sell_in -= 1

    def update_quality_value(self, item):
        if item.name == self.AGED_BRIE:
            self.increase_quality(item)
            if item.sell_in < 0:
                self.increase_quality(item)

        elif item.name == self.BACKSTAGE_PASS:
            if item.sell_in < 0:
                item.quality = self.MIN_QUALITY
            else:
                self.increase_quality(item)
                if item.sell_in < 10:
                    self.increase_quality(item)
                if item.sell_in < 5:
                    self.increase_quality(item)

        elif item.name == self.CONJURED:
            self.decrease_quality(item, 2 if item.sell_in >= 0 else 4)

        elif item.name != self.SULFURAS:
            self.decrease_quality(item, 1 if item.sell_in >= 0 else 2)

    def increase_quality(self, item, amount=1):
        item.quality = min(self.MAX_QUALITY, item.quality + amount)

    def decrease_quality(self, item, amount=1):
        item.quality = max(self.MIN_QUALITY, item.quality - amount)


class Item:
    def __init__(self, name, sell_in, quality):
        self.name = name
        self.sell_in = sell_in
        self.quality = quality

    def __repr__(self):
        return "%s, %s, %s" % (self.name, self.sell_in, self.quality)
