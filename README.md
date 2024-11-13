from gilded_rose import GildedRose, Item

def test_normal_item_before_sell_in():
    items = [Item("Normal Item", sell_in=10, quality=20)]
    gilded_rose = GildedRose(items)
    gilded_rose.update_quality()
    assert items[0].sell_in == 9
    assert items[0].quality == 19

def test_normal_item_after_sell_in():
    items = [Item("Normal Item", sell_in=0, quality=20)]
    gilded_rose = GildedRose(items)
    gilded_rose.update_quality()
    assert items[0].sell_in == -1
    assert items[0].quality == 18  # 賣出期限後，品質下降2

def test_quality_never_negative():
    items = [Item("Normal Item", sell_in=5, quality=0)]
    gilded_rose = GildedRose(items)
    gilded_rose.update_quality()
    assert items[0].quality == 0  # 品質不會為負數

def test_aged_brie_increases_in_quality():
    items = [Item("Aged Brie", sell_in=2, quality=0)]
    gilded_rose = GildedRose(items)
    gilded_rose.update_quality()
    assert items[0].quality == 1  # Aged Brie 隨著時間增加

def test_aged_brie_max_quality():
    items = [Item("Aged Brie", sell_in=2, quality=50)]
    gilded_rose = GildedRose(items)
    gilded_rose.update_quality()
    assert items[0].quality == 50  # 品質不會超過50

def test_sulfuras_quality():
    items = [Item("Sulfuras, Hand of Ragnaros", sell_in=5, quality=80)]
    gilded_rose = GildedRose(items)
    gilded_rose.update_quality()
    assert items[0].sell_in == 5  # Sulfuras 不會變過期
    assert items[0].quality == 80  # Sulfuras 品質不變

def test_backstage_passes_increase():
    items = [Item("Backstage passes to a TAFKAL80ETC concert", sell_in=15, quality=20)]
    gilded_rose = GildedRose(items)
    gilded_rose.update_quality()
    assert items[0].quality == 21  # 品質加1

def test_backstage_passes_increase_by_2():
    items = [Item("Backstage passes to a TAFKAL80ETC concert", sell_in=10, quality=20)]
    gilded_rose = GildedRose(items)
    gilded_rose.update_quality()
    assert items[0].quality == 22  # 期限10天或更少時，品質加2

def test_backstage_passes_increase_by_3():
    items = [Item("Backstage passes to a TAFKAL80ETC concert", sell_in=5, quality=20)]
    gilded_rose = GildedRose(items)
    gilded_rose.update_quality()
    assert items[0].quality == 23  # 期限5天或更少時，品質加3

def test_backstage_passes_quality_drops_to_zero():
    items = [Item("Backstage passes to a TAFKAL80ETC concert", sell_in=0, quality=20)]
    gilded_rose = GildedRose(items)
    gilded_rose.update_quality()
    assert items[0].quality == 0
