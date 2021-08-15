/*
 * @Coding: utf-8
 * @Author: vector-wlc
 * @Date: 2020-09-18 09:39:24
 * @Description: 
 */
#include "VSCodeQtConfigurator.h"
#include <qpushbutton.h>
#include <qstatusbar.h>

VSCodeQtConfigurator::VSCodeQtConfigurator(QWidget* parent)
    : QMainWindow(parent)
{
    project_dir_btn = new HLayoutPair<QLabel, QPushButton>;
    project_name_edit = new HLayoutPair<QLabel, QLineEdit>;
    qt_dir_btn = new HLayoutPair<QLabel, QPushButton>;
    select_kit_box = new HLayoutPair<QLabel, QComboBox>;
    creat_configure_btn = new QPushButton("生成配置");

    creatUi();
    creatConnect();
}

VSCodeQtConfigurator::~VSCodeQtConfigurator()
{
}

void VSCodeQtConfigurator::creatUi()
{
    this->setFont(QFont("Microsoft YaHei"));
    auto v_layout = new QVBoxLayout;
    project_dir_btn->first.setText("项目路径 : ");
    project_name_edit->first.setText("项目名称 : ");
    qt_dir_btn->first.setText("Qt 安装路径 : ");
    select_kit_box->first.setText("Qt 套件 : ");
    v_layout->addWidget(project_dir_btn);
    v_layout->addWidget(project_name_edit);
    v_layout->addWidget(qt_dir_btn);
    v_layout->addWidget(select_kit_box);
    v_layout->addWidget(creat_configure_btn);

    auto central_widget = new QWidget;
    central_widget->setLayout(v_layout);
    this->setCentralWidget(central_widget);
}

void VSCodeQtConfigurator::creatConnect()
{
    connect(&project_dir_btn->second, &QPushButton::released, [=]() {
        project_dir = QFileDialog::getExistingDirectory(this, "选择项目路径", QDir::currentPath());
        project_dir_btn->second.setText(project_dir);
    });

    connect(&qt_dir_btn->second, &QPushButton::released, [=]() {
        qt_dir = QFileDialog::getExistingDirectory(this, "选择 Qt 安装路径", QDir::currentPath());
        qt_dir_btn->second.setText(qt_dir);
        getKitDir();
        for (const auto& qt_kit_dir : qt_kit_dir_list) {
            this->select_kit_box->second.addItem(qt_kit_dir);
        }
    });

    connect(creat_configure_btn, &QPushButton::released, [=]() {
        creatFiles();
    });
}

void VSCodeQtConfigurator::getKitDir()
{
    QDir one_dir(qt_dir);
    auto one_dir_list = one_dir.entryList();
    qt_kit_dir_list.clear();
    for (const auto& each_one_dir : one_dir.entryList()) {
        if (each_one_dir[0] >= '0' && each_one_dir[0] <= '9') { // 如果是数字
            QDir two_dir(qt_dir + "\\" + each_one_dir);
            auto two_dir_list = two_dir.entryList();
            for (const auto& each_two_dir : two_dir_list) {
                if (each_two_dir.contains("mingw") || each_two_dir.contains("msvc")) {
                    qt_kit_dir_list.append(two_dir.path() + "/" + each_two_dir);
                }
            }
        }
    }
}

void VSCodeQtConfigurator::newDir(const QString& parent_dir_name, const QString& new_dir_name)
{
    QDir parent_dir(parent_dir_name);
    QDir new_dir(parent_dir_name + "\\" + new_dir_name);
    if (!new_dir.exists()) {
        if (!parent_dir.mkdir(new_dir_name)) {
            Error(QString("创建 %1 文件夹失败").arg(new_dir_name));
            return;
        }
    }
}

QString VSCodeQtConfigurator::readAllFile(const QString& file_name)
{
    auto file = new QFile(file_name);
    if (!file->open(QFile::ReadOnly | QIODevice::Text)) {
        Error("无法读取文件 ：" + file_name);
        delete file;
        return "";
    }
    auto text_stream = new QTextStream(file);
    text_stream->setCodec("utf-8");
    auto all_str = text_stream->readAll();
    delete text_stream;
    file->close();
    delete file;
    return all_str;
}

void VSCodeQtConfigurator::writeAllFile(const QString& file_name, const QString& text)
{
    auto file = new QFile(file_name);
    if (!file->open(QFile::WriteOnly | QIODevice::Text)) {
        Error("无法创建文件 ： " + file_name);
        delete file;
        return;
    }
    auto text_stream = new QTextStream(file);
    text_stream->setCodec("utf-8");
    (*text_stream) << text;
    delete text_stream;
    file->close();
    delete file;
}

void VSCodeQtConfigurator::copyFile(const QString& src_file, const QString& new_file)
{
    QFile file(new_file);
    if (file.exists()) {
        file.remove();
        file.close();
    }
    if (!QFile::copy(src_file, new_file)) {
        Error("复制文件 " + new_file + " 失败");
    }
}

bool VSCodeQtConfigurator::isCreatable()
{
    if (project_dir.size() == 0) {
        Error("请选择项目路径");
        return false;
    }

    project_name = project_name_edit->second.text();
    if (project_name.size() == 0) {
        Error("请填写项目名称");
        return false;
    }

    if (qt_kit_dir_list.size() == 0) {
        Error("未找到相应的 Qt 套件，请重新选择 Qt 安装根目录");
        return false;
    }

    return true;
}

void VSCodeQtConfigurator::creatFiles()
{
    if (!isCreatable()) {
        return;
    }
    newDir(project_dir, project_name);
    project_root_dir = project_dir + "\\" + project_name;
    newDir(project_root_dir, ".vscode");
    newDir(project_root_dir, "scripts");
    newDir(project_root_dir, "src");

    is_msvc = this->select_kit_box->second.currentText().contains("msvc");
    src_files_dir = is_msvc ? "./files/MSVC" : "./files/MinGW";
    src_files_dir += "/";
    creatVSCodeJsonFiles();
    creatBatFiles();
    creatSrcAndPro();
}

void VSCodeQtConfigurator::creatVSCodeJsonFiles()
{

    // c_cpp_properties
    QString all_str = readAllFile(src_files_dir + "c_cpp_properties.json");
    if (all_str.size() == 0) {
        return;
    }
    all_str.replace("__QT_KIT_INCLUDE__", select_kit_box->second.currentText() + "/include/**");
    writeAllFile(project_root_dir + "/.vscode/c_cpp_properties.json", all_str);

    kit_name = *(select_kit_box->second.currentText().split("/").end() - 1);

    // launch
    if (is_msvc) {
        copyFile(src_files_dir + "launch.json", project_root_dir + "/.vscode/launch.json");
    } else {
        QString all_str = readAllFile(src_files_dir + "launch.json");
        if (all_str.size() == 0) {
            return;
        }
        int index_ = kit_name.indexOf('_');
        debugger_name = kit_name.insert(index_, '0');
        QString debugger_path = qt_dir + "/Tools/" + debugger_name + "/bin/gdb.exe";
        all_str.replace("__DEBUGGER_PATH__", debugger_path);
        writeAllFile(project_root_dir + "/.vscode/launch.json", all_str);
    }

    // tasks
    copyFile(src_files_dir + "tasks.json", project_root_dir + "/.vscode/tasks.json");

    // settings
    if (is_msvc) {
        copyFile(src_files_dir + "settings.json", project_root_dir + "/.vscode/settings.json");
    }
}

void VSCodeQtConfigurator::creatBatFiles()
{
    QString all_str = readAllFile(src_files_dir + "build.bat");
    if (all_str.size() == 0) {
        return;
    }
    QString qt_kit_dir = select_kit_box->second.currentText();
    qt_kit_dir.replace('/', '\\');
    all_str.replace("__QT_KIT_DIR__", qt_kit_dir);
    all_str.replace("__PROJECT_NAME__", project_name);
    if (is_msvc) { // 获取 VS 的版本号
        QString vs_version = kit_name.remove("msvc");
        is_x64 = vs_version.contains("_64");
        vs_version.remove("_64");
        all_str.replace("__VS_VERSION__", vs_version);
    } else {
        QString mingw_path = qt_dir + "\\Tools\\" + debugger_name;
        QString jom_path = qt_dir + "\\Tools\\QtCreator\\bin\\jom.exe";
        mingw_path.replace('/', '\\');
        jom_path.replace('/', '\\');
        all_str.replace("__MINGW_PATH__", mingw_path);
        all_str.replace("__JOM_PATH__", jom_path);
    }

    if (is_msvc) {
        if (is_x64) {
            all_str.replace("__EXEC_BITS__", "x64");
        } else {
            all_str.replace("__EXEC_BITS__", "x86");
        }
    }
    // debug
    QString build_debug_str = all_str;
    build_debug_str.replace("__QMAKE_MODE__", "\"CONFIG+=debug\" \"CONFIG+=console\"");
    build_debug_str.replace("__BUILD_MODE__", "debug");
    build_debug_str.replace("__MAKEFILE_MODE__", "Debug");
    writeAllFile(project_root_dir + "/scripts/build_debug.bat", build_debug_str);

    // release
    QString build_release_str = all_str;
    build_release_str.replace("__QMAKE_MODE__", "\"CONFIG+=release\"");
    build_release_str.replace("__BUILD_MODE__", "release");
    build_release_str.replace("__MAKEFILE_MODE__", "Release");
    writeAllFile(project_root_dir + "/scripts/build_release.bat", build_release_str);
}

void VSCodeQtConfigurator::creatSrcAndPro()
{
    copyFile(src_files_dir + "src\\main.cpp", project_root_dir + "\\src\\main.cpp");
    copyFile(src_files_dir + "src\\mainwindow.cpp", project_root_dir + "\\src\\mainwindow.cpp");
    copyFile(src_files_dir + "src\\mainwindow.h", project_root_dir + "\\src\\mainwindow.h");
    copyFile("./files/VSCode_Qt.pro", project_root_dir + "\\" + project_name + ".pro");
}