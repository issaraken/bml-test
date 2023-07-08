/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Papa from "papaparse";
import Dropdown from "react-dropdown";

function App() {
  const [dataLists, setDataLists] = useState([]);
  const [dataSelect, setDataSelect] = useState([]);
  const [dataShow, setDataShow] = useState([]);
  const [districtLists, setDistrictLists] = useState([]);
  const [district, setDistrict] = useState("");
  const [yearLists, setYearLists] = useState([]);
  const [year1, setYear1] = useState([]);
  const [year2, setYear2] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("./bkk_population_growth.csv");
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder("utf-8");
      const csvData = decoder.decode(result.value);
      const parsedData = Papa.parse(csvData, {
        header: false,
        skipEmptyLines: true,
      }).data;

      onSetData(parsedData);
    };

    fetchData();
  }, []);

  useEffect(() => filterDataShow(), [year1, year2]);

  const onSetData = async (data) => {
    const realData = data.splice(1, 50);
    const header = [...data[0]].splice(2);
    onSetYear(header);
    onSetDT(realData);

    const dataSet = await realData.map((d) => {
      let percentage = [];
      const valueData = d.splice(2).map((dd, i) => {
        const pc = Number(dd.replace("%", ""));
        percentage.push(pc);
        return {
          name: dd,
          value: pc,
          year: Number(header[i]),
        };
      });

      return {
        dcode: d[0],
        name: d[1],
        min: Math.min(...percentage),
        max: Math.max(...percentage),
        data: valueData,
      };
    });

    setDataLists(dataSet);
    setDataSelect(dataSet[0]);
    setDataShow(dataSet[0]);
  };

  const onSetDT = (data) => {
    const dtData = data.map((d) => d[1]);
    setDistrictLists(dtData);
    setDistrict(dtData[0]);
  };

  const onSetYear = (data) => {
    const yData = data.map((d) => {
      return {
        label: "พ.ศ. " + d,
        value: Number(d),
      };
    });

    setYearLists(yData);
    setYear1(yData[0]);
    setYear2(yData[yData.length - 1]);
  };

  const onChangeDistrict = (e) => {
    setDistrict(e.value);
    setYear1(yearLists[0]);
    setYear2(yearLists[yearLists.length - 1]);

    const findData = dataLists.find((d) => d.name === district);
    setDataSelect(findData);
    setDataShow(findData);
  };

  const onChnageYear1 = (e) => {
    const value = e.value > year2.value ? year2 : e;
    setYear1(value);
  };

  const onChangeYear2 = (e) => {
    const value = e.value < year1.value ? year1 : e;
    setYear2(value);
  };

  const filterDataShow = () => {
    const data = dataSelect.data?.filter((d) => {
      return d.year >= year1.value && d.year <= year2.value;
    });
    setDataShow({ ...dataSelect, data: data });
  };

  return (
    <div className="container">
      <div className="block-subject text-header-1">
        สถิติประชากรกรุงเทพฯ พ.ศ. 2550 - 2559
      </div>

      <div className="block-area">
        <div className="text-header-3">ลักษณะพื้นที่</div>
        <div className="content-detail-1">
          กรุงเทพฯ เป็นจังหวัดที่มีประชากรมากที่สุดใน
          ประเทศไทยหากรวมประชากรแฝงที่ไม่ปรากฏในทะเบียนและคนที่เดินทางมาทำงานในตอนกลางวันด้วยแล้ว
          คาดว่าจะสูงถึงเกือบเท่าตัวของ ประชากรที่ปรากฏในทะเบียน เราจึงเรียก
          กรุงเทพฯ ว่าเป็น{" "}
          <a
            href="https://en.wikipedia.org/wiki/Megacity"
            target="_blank"
            rel="noreferrer"
          >
            “อภิมหานคร (megacity)”
          </a>{" "}
          คือมีประชากรตั้งแต่ 10
        </div>
        <div className="content-detail-2">
          ล้านคนขึ้นไป อัตราเพิ่มของประชากรกรุงเทพฯ อยู่ระดับเกือบ 1%
          และเริ่มลดลงในปี 2559 ดังแสดงในแผนภูมิ ต่อไปนี้
        </div>
      </div>

      <div className="block-filter">
        <div className="text-header-3">การเติบโต</div>
        <div className="content-filter">
          <div className="sub-content">
            <div>เขต</div>
            <div>
              <Dropdown
                options={districtLists}
                value={district}
                onChange={onChangeDistrict}
              />
            </div>
          </div>

          <div className="sub-content">
            <div>ตั้งแต่</div>
            <div>
              <Dropdown
                options={yearLists}
                value={year1}
                onChange={onChnageYear1}
              />
            </div>
            <div>ถึง</div>
            <div>
              <Dropdown
                options={yearLists}
                value={year2}
                onChange={onChangeYear2}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="block-graph">
        <div className="content-graph-header">
          <div className="header-min">{dataShow.min + "%"}</div>
          <div className="header-max">{dataShow.max + "%"}</div>
        </div>

        {dataShow?.data?.map((item) => {
          return (
            <div className="content-graph">
              <div className="box-name">{item.year}</div>
              <div className="box-value">{item.value}</div>
            </div>
          );
        })}
      </div>

      <div className="block-tag">
        <div className="text-header-3">แหล่งข้อมูล</div>
        <ul className="content-link">
          <li className="link">
            <a
              href="https://stat.bora.dopa.go.th/stat/statnew/statMONTH/statmonth/"
              target="_blank"
              rel="noreferrer"
            >
              สำนักบริหารการทะเบียน กรมการปกครอง กระทรวงมหาดไทย, จำนวนประชากร,
              สำนักบริหารการทะเบียน กรมการปกครอง กระทรวงมหาดไทย, Editor. 2564:
              กรุงเทพฯ.
            </a>
          </li>
          <li className="link">
            <a href="http://www.nso.go.th/" target="_blank" rel="noreferrer">
              สำนักงานสถิติแห่งชาติ, การสำรวจภาวะเศรษฐกิจและสังคมของครัวเรือน
              พ.ศ. 2563 สำนักงานสถิติแห่งชาติ, Editor. 2563: กรุงเทพฯ
            </a>
          </li>
          <li className="link">
            <a
              href="http://www.price.moc.go.th/"
              target="_blank"
              rel="noreferrer"
            >
              สำนักดัชนีเศรษฐกิจการค้า กระทรวงพาณิชย์,
              ข้อมูลดัชนีราคาผู้บริโภคทั่วไป, สำนักดัชนีเศรษฐกิจการค้า
              กระทรวงพาณิชย์, Editor. 2563: กรุงเทพฯ.
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;
