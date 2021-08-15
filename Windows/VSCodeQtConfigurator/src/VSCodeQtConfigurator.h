/*
 * @Coding: utf-8
 * @Author: vector-wlc
 * @Date: 2020-09-18 09:39:24
 * @Description: 
 */
#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include "HLayoutPair.h"
#include <QMainWindow>
#include <qcombobox.h>
#include <qdebug.h>
#include <qfiledialog.h>
#include <qlabel.h>
#include <qlayout.h>
#include <qlineedit.h>
#include <qmessagebox.h>
#include <qpushbutton.h>
#include <qtextstream.h>

#define Error(info) QMessageBox::information(this, "错误", info)

#define __debug qDebug() << __FILE__ << __LINE__

class VSCodeQtConfigurator : public QMainWindow {
    Q_OBJECT

public:
    VSCodeQtConfigurator(QWidget* parent = nullptr);
    ~VSCodeQtConfigurator();

private:
    bool is_msvc;
    bool is_x64;
    QString project_dir;
    QString project_name;
    QString project_root_dir;
    QString qt_dir;
    QStringList qt_kit_dir_list;
    QString compiler_dir;
    QString debugger_name;
    QString src_files_dir;
    QString kit_name;

    HLayoutPair<QLabel, QPushButton>* project_dir_btn;
    HLayoutPair<QLabel, QLineEdit>* project_name_edit;
    HLayoutPair<QLabel, QPushButton>* qt_dir_btn;
    HLayoutPair<QLabel, QComboBox>* select_kit_box;
    QPushButton* creat_configure_btn;

    void creatUi();
    void creatConnect();
    void getKitDir();

    void newDir(const QString& parent_dir_name, const QString& new_dir_name);
    QString readAllFile(const QString& file_name);
    void writeAllFile(const QString& file_name, const QString& text);
    void copyFile(const QString& src_file, const QString& new_file);

    bool isCreatable();
    void creatFiles();
    void creatVSCodeJsonFiles();
    void creatBatFiles();
    void creatSrcAndPro();
};
#endif // MAINWINDOW_H
