import unittest

from mnetplus_subs import Cue, extract_video_id, select_languages, srt_timestamp, to_srt


class ExtractVideoIdTests(unittest.TestCase):
    def test_from_url(self):
        self.assertEqual(
            extract_video_id("https://mnetplus.world/media/zh-CN/videos/6a7581996b4b0e2c30b281a5"),
            "6a7581996b4b0e2c30b281a5",
        )

    def test_from_id(self):
        self.assertEqual(extract_video_id("6a7581996b4b0e2c30b281a5"), "6a7581996b4b0e2c30b281a5")


class SrtTests(unittest.TestCase):
    def test_timestamp(self):
        self.assertEqual(srt_timestamp(65.432), "00:01:05,432")

    def test_render(self):
        text = to_srt([Cue(1, 2.5, "안녕하세요", "ko")])
        self.assertEqual(text, "1\n00:00:01,000 --> 00:00:03,500\n안녕하세요\n")


class LanguageTests(unittest.TestCase):
    def test_select(self):
        cfg = [{"language": "ko"}, {"language": "en"}, {"language": "zh_CN"}]
        self.assertEqual(select_languages(cfg, "ko,en"), ["ko", "en"])
        self.assertEqual(select_languages(cfg, "all"), ["ko", "en", "zh_CN"])


if __name__ == "__main__":
    unittest.main()
