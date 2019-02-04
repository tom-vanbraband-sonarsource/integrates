import os
import time

from django.test import TestCase
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class ViewTestCase(TestCase):

    def setUp(self):
        options = Options()
        options.headless = True
        self.delay = 10
        self.selenium = webdriver.Firefox(options=options)
        self.branch = os.environ['CI_COMMIT_REF_NAME']
        self.url = \
            'https://{}.integrates.env.fluidattacks.com'.format(self.branch)
        self.username = os.environ['FI_INTEGRATES_USER']
        self.password = os.environ['FI_INTEGRATES_USERPASS']

        super(ViewTestCase, self).setUp()

    def tearDown(self):
        self.selenium.quit()
        super(ViewTestCase, self).tearDown()

    def __login(self):
        selenium = self.selenium
        selenium.get(self.url)
        selenium.find_element_by_xpath(
            "//*[contains(text(), 'Log in with Google')]").click()
        email_id = \
            WebDriverWait(selenium,
                          self.delay).until(
                              EC.presence_of_element_located(
                                  (By.NAME, 'identifier')))

        email_id.send_keys(self.username)
        selenium.find_elements_by_xpath(
            "//*[contains(text(), 'Next')]")[1].click()
        time.sleep(3)
        pass_id = \
            WebDriverWait(selenium,
                          self.delay).until(
                              EC.presence_of_element_located(
                                  (By.XPATH,
                                   "//*[contains(@type, 'password')]")))

        pass_id.send_keys(self.password)
        selenium.find_elements_by_xpath(
            "//*[contains(text(), 'Next')]")[1].click()
        WebDriverWait(selenium,
                      self.delay).until(
                          EC.presence_of_element_located(
                                (By.XPATH,
                                "//*[contains(text(), 'Integrates unit test project')]")))
        return selenium

    def test_1_init_page(self):
        selenium = self.selenium
        selenium.get(self.url)
        assert 'Log in with Google' in selenium.page_source

    def test_2_dashboard(self):
        selenium = self.__login()

        assert 'Integrates unit test project' in selenium.page_source

    def test_3_indicators(self):
        selenium = self.__login()
        proj_elem = WebDriverWait(selenium,
                                  self.delay).until(
                                      EC.presence_of_element_located(
                                          (By.XPATH,
                                           "//*[contains(text(), 'Integrates unit test project')]")))
        proj_elem.click()
        WebDriverWait(selenium,
                      self.delay).until(
                            EC.presence_of_element_located(
                                (By.XPATH,
                                "//*[contains(text(), 'Maximum Severity Found')]")))

        assert 'Maximum Severity Found' in selenium.page_source

    def test_4_findings(self):
        selenium = self.__login()
        proj_elem = WebDriverWait(selenium,
                                  self.delay).until(
                                      EC.presence_of_element_located(
                                          (By.XPATH,
                                           "//*[contains(text(), 'Integrates unit test project')]")))
        proj_elem.click()

        selenium.get(self.url + '/dashboard#!/project/UNITTESTING/findings')
        WebDriverWait(selenium,
                      self.delay).until(
                            EC.presence_of_element_located(
                                (By.XPATH,
                                "//*[contains(text(), 'digo funcional comentado')]")))
        assert 'digo funcional comentado' in selenium.page_source

    def test_5_finding(self):
        selenium = self.__login()
        proj_elem = WebDriverWait(selenium,
                                  self.delay).until(
                                      EC.presence_of_element_located(
                                          (By.XPATH,
                                           "//*[contains(text(), 'Integrates unit test project')]")))
        proj_elem.click()

        selenium.get(self.url + '/dashboard#!/project/UNITTESTING/findings')
        find_ele = WebDriverWait(selenium,
                                self.delay).until(
                                    EC.presence_of_element_located(
                                        (By.XPATH,
                                         "//*[contains(text(), 'digo funcional comentado')]")))
        find_ele.click()
        WebDriverWait(selenium,
                      self.delay).until(
                            EC.presence_of_element_located(
                                (By.XPATH,
                                "//*[contains(text(), 'vulnerabilities.yaml')]")))
        assert 'lo que aumenta la probabilidad de' in selenium.page_source
        assert 'REQ.0171. Los comentarios del' in selenium.page_source
        assert 'vulnerabilities.yaml' in selenium.page_source