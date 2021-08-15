/*
 * @Coding: utf-8
 * @Author: vector-wlc
 * @Date: 2021-08-14 16:29:08
 * @Description: 
 */
#include "VSCodeQtConfigurator.h"

#include <QApplication>

int main(int argc, char* argv[])
{
    QApplication a(argc, argv);
    VSCodeQtConfigurator w;
    w.show();
    return a.exec();
}
